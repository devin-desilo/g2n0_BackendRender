import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  IUserExperience,
  UserExperience,
} from './entities/user-experience.entity';

@Injectable()
export class UserExperienceService {
  constructor(
    @InjectModel(UserExperience.name)
    private readonly userExperienceModel: Model<UserExperience>,
  ) {}

  async create(
    userId: string,
    createUserExperienceDto: Partial<IUserExperience>,
  ): Promise<UserExperience> {
    const createdUserExperience = new this.userExperienceModel(
      createUserExperienceDto,
    );
    createdUserExperience.userId = userId;
    return createdUserExperience.save();
  }

  async findAll(): Promise<UserExperience[]> {
    return this.userExperienceModel.find().exec();
  }

  async getUserExperience(userId: string): Promise<UserExperience[]> {
    return this.userExperienceModel
      .find({
        userId,
      })
      .exec();
  }

  async findOne(id: string): Promise<UserExperience> {
    return this.userExperienceModel.findById(id).exec();
  }

  async update(
    id: string,
    updateUserExperienceDto: Partial<IUserExperience>,
  ): Promise<UserExperience> {
    return this.userExperienceModel
      .findByIdAndUpdate(id, updateUserExperienceDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<UserExperience> {
    return this.userExperienceModel.findByIdAndDelete(id).exec();
  }

  async findByUserId(userId: string): Promise<UserExperience[]> {
    return this.userExperienceModel.find({ userId }).exec();
  }
}
