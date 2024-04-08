import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export interface IUser extends Document {
  first_name: string;
  last_name: string;
  roleId: number;
  email: string;
  location: string;
  dob: Date;
  gender: string;
  password: string;
  otp: string;
  expiration_time: Date;
  verified: boolean;
  isProfileCompleted: boolean;
  isActive: boolean;
  reset_password_token: string;
  profileImage: string;
  device_token: string;
  isNotification: boolean;
  iam: string;
  age: string;
  levelEducation: string;
  industry: string[];
  areaOfInterest: string[];
  aboutUs: string;
  servicesProvided?: string;
  shareUrl?: string;
  linkdinUrl?: string;
  coverImage?: string;
  platform?: string;
}

@Schema()
export class Users extends Document implements IUser {
  @Prop({ required: false })
  first_name: string;

  @Prop({ required: false })
  last_name: string;

  @Prop({ required: true })
  roleId: number;

  @Prop({ required: true })
  email: string;

  @Prop({ required: false })
  location: string;

  @Prop({ required: false })
  dob: Date;

  @Prop({ required: false })
  gender: string;

  @Prop({ required: false })
  password: string;

  @Prop()
  otp: string;

  @Prop()
  expiration_time: Date;

  @Prop({ required: false, default: false })
  verified: boolean;

  @Prop({ required: false, default: false })
  isProfileCompleted: boolean;

  @Prop({ default: false })
  isActive: boolean;

  @Prop({ required: false })
  reset_password_token: string;

  @Prop({ required: false })
  profileImage: string;

  @Prop({ required: false })
  aboutUs: string;

  @Prop({ default: null })
  device_token: string;

  @Prop({ default: true })
  isNotification: boolean;

  @Prop({ required: false })
  iam: string;

  @Prop({ required: false })
  age: string;

  @Prop({ required: false })
  levelEducation: string;

  @Prop({ required: false })
  industry: string[];

  @Prop({ required: false })
  areaOfInterest: string[];

  @Prop({ required: false })
  servicesProvided: string;

  @Prop({ required: false })
  shareUrl: string;

  @Prop({ required: false })
  linkdinUrl: string;

  @Prop({ required: false })
  coverImage: string;

  @Prop({ required: false })
  platform: string; // Add platform key
}

export const UserSchema = SchemaFactory.createForClass(Users);
