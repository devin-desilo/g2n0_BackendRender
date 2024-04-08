import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface IUserExperience extends Document {
  userId: string;
  title: string;
  organization: string;
  city: string;
  country: string;
  from: string;
  to: string;
  description: string;
}

@Schema({ timestamps: true })
export class UserExperience extends Document implements IUserExperience {
  @Prop({ type: Types.ObjectId, ref: 'Users' })
  userId: string;

  @Prop({ required: false })
  city: string;

  @Prop({ required: false })
  country: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  organization: string;

  @Prop({ required: false, default: null })
  from: string;

  @Prop({ required: false, default: null })
  to: string;

  @Prop({ required: false, default: null })
  description: string;
}

export const UserExperienceSchema =
  SchemaFactory.createForClass(UserExperience);
