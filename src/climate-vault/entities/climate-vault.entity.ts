import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Category } from './category.entity';

@Schema()
export class ClimateVault extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, enum: ['Article', 'Video'] })
  type: 'Article' | 'Video';

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  file: string; // File path

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  category: Category;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const ClimateVaultSchema = SchemaFactory.createForClass(ClimateVault);
