import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  CreateUserSecondDto,
  CreateUsersDto,
  LoginUserDto,
  RegisterUser,
} from '@src/auth/dto/create-auth.dto';
import { UpdateUserSecondDto } from '@src/auth/dto/update-auth.dto';
import { Users } from '@src/config/db/schemas';
import { IUser } from '@src/config/db/schemas/user.model';
import {
  IUserExperience,
  UserExperience,
} from '@src/user-experience/entities/user-experience.entity';
import bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(Users.name) private readonly userModel: Model<IUser>,
    @InjectModel(UserExperience.name)
    private readonly userExperienceModel: Model<IUserExperience>,
  ) {}
  create(createUserDto: RegisterUser) {
    return this.userModel.create(createUserDto);
  }
  createLinkdin(createUserDto) {
    return this.userModel.create(createUserDto);
  }

  findAll() {
    return this.userModel.find().select('-password').exec();
  }

  async findOne(id: string) {
    return this.userModel.findById(id).select('-password').lean().exec();
  }

  async updateProfile(id: string, updateUserDto: UpdateUserSecondDto) {
    // const areaOfInterest = updateUserDto.areaOfInterest?.split(',') ?? [];
    // const industry = updateUserDto.industry?.split(',') ?? [];
    const otherRes =
      updateUserDto?.first_name && updateUserDto?.last_name
        ? { isProfileCompleted: true }
        : {};
    return this.userModel
      .findByIdAndUpdate(
        id,
        {
          ...updateUserDto,
          ...otherRes,
        },
        { new: true },
      )
      .exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { password, ...updateData } = updateUserDto;
    const updateDatas: any = updateData;
    if (password) {
      const salt = bcrypt.genSaltSync(12);
      const hashedPassword = bcrypt.hashSync(password, salt);
      updateDatas.password = hashedPassword;
    }
    return this.userModel
      .findByIdAndUpdate(id, updateDatas, { new: true })
      .exec();
  }

  async remove(id: string) {
    const result = await this.userModel.deleteOne({ _id: id }).exec();
    return result.deletedCount > 0;
  }

  async getProfile(userId: string) {
    return await this.userModel
      .findOne({ where: { id: userId } })
      .select('-password')
      .exec();
  }

  async getByWhere(where) {
    return await this.userModel.findOne(where).select('-password').exec();
  }

  async authenticate(credentials: LoginUserDto): Promise<any> {
    try {
      const dbUser: any = await this.userModel.findOne({
        email: credentials.email,
      });

      if (dbUser) {
        const check = await bcrypt.compare(
          credentials.password,
          dbUser.password,
        );
        if (!check) {
          throw Error('Username or Password are invalid');
        }
        if (credentials?.device_token) {
          await this.userModel
            .findByIdAndUpdate(
              dbUser._id,
              {
                platform: credentials?.platform,
                device_token: credentials?.device_token,
              },
              { new: true },
            )
            .exec();
        }

        const returnUser = await this.findOne(dbUser.id);
        return returnUser;
      }
      return Promise.resolve(null);
    } catch (error) {
      console.log(error, 'error');
      return Promise.reject(error);
    }
  }

  async registerStep(credentials: CreateUserSecondDto): Promise<any> {
    const { id, experience, ...updateData } = credentials;
    const experienceData = experience ? JSON.parse(experience) : [];
    updateData.profileImage = updateData.profileImage?.path ?? null;
    const check = await this.getByWhere({
      _id: id,
    });
    if (!check) {
      throw new Error('Invalid User id');
    }

    const user = await this.updateProfile(credentials.id, {
      ...updateData,
    });
    if (!user) {
      throw new Error('Invalid User detail');
    }
    if (experienceData.length > 0) {
      for (let index = 0; index < experienceData.length; index++) {
        const element = experienceData[index];
        await this.userExperienceModel.create({ ...element, userId: user._id });
      }
    }
    return user;
  }

  async changeStatus(credentials: CreateUserSecondDto): Promise<any> {
    console.log('cred', credentials);
    const { id, ...updateData } = credentials;

    const check = await this.getByWhere({
      _id: id,
    });
    if (!check) {
      throw new Error('Invalid User id');
    }

    const user = await this.updateProfile(credentials.id, {
      ...updateData,
    });
    if (!user) {
      throw new Error('Invalid User detail');
    }
    return user;
  }

  async createUser(updateData: CreateUsersDto): Promise<any> {
    const user = await this.userModel.create(updateData);
    return user;
  }
}
