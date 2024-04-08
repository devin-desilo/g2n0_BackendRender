import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateNotificationDto } from './dto/create-notification.dto';
import {
  INotificationStatus,
  Notification,
} from './entities/notification.entity';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Users } from '@src/config/db/schemas';
import { IUser } from '@src/config/db/schemas/user.model';
import { FirebaseService } from '@src/firebase/firebase.service';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Users.name) private readonly userModel: Model<IUser>,
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
    private readonly firebase: FirebaseService,
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const createdNotification = new this.notificationModel(
      createNotificationDto,
    );
    return createdNotification.save();
  }

  async createNewPostNotification(
    user_id: string,
    title: string,
    body: string,
    data?: Record<string, any> | null,
  ) {
    const users = await this.userModel.findById(user_id);

    const payload = {
      notification: {
        title: title,
        body: body,
      },
      token: users?.device_token ?? null,
      data,
    };

    await this.notificationModel.create({
      title,
      userId: user_id,
      message: body,
      payload,
      status: INotificationStatus.UNREAD,
    });

    if (users?.device_token && users?.isNotification) {
      return this.firebase
        .postNotification(
          users.device_token,
          body,
          {
            action: 'click',
            data: payload,
          },
          title,
        )
        .then(() => {
          return true;
        })
        .catch(() => {
          return false;
        });
    }
    return true;
  }

  async sendNotification(user_id: string | null, payload: Record<string, any>) {
    const users = await this.userModel.findById(user_id);
    const { title, body } = payload.notification;
    if (users?.device_token) {
      if (users?.isNotification) {
        return this.firebase
          .postNotification(
            users?.device_token,
            body,
            {
              action: 'test',
              data: payload,
            },
            title,
          )
          .then(async (response) => {
            await this.notificationModel.create({
              title,
              userId: user_id,
              message: body,
              payload,
              status: INotificationStatus.UNREAD,
            });
            return Promise.resolve(response);
          })
          .catch((error) => {
            return Promise.reject(error);
          });
      } else {
        const response = await this.notificationModel.create({
          title,
          userId: user_id,
          message: body,
          payload,
          status: INotificationStatus.UNREAD,
        });
        return Promise.resolve(response);
      }
    }
    return Promise.reject('Invalid device token');
  }

  async findAll(userId: string): Promise<Notification[]> {
    console.log(userId);
    const query = await this.notificationModel.find({ userId: userId }).exec();
    return query;
  }

  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationModel.findById(id).exec();
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return notification;
  }

  async update(
    id: string,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<Notification> {
    const existingNotification = await this.notificationModel.findByIdAndUpdate(
      id,
      updateNotificationDto,
      { new: true },
    );
    if (!existingNotification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return existingNotification;
  }

  async remove(id: string) {
    const deletedNotification = await this.notificationModel
      .deleteOne({ _id: id })
      .exec();
    if (!deletedNotification) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return deletedNotification;
  }
}
