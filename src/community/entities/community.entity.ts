import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { IMemberCommunity, Member } from './member.entity';

export interface ICommunity extends Document {
  userId: string;
  name: string;
  image: string;
  description: string;
  isActive: boolean;
  members: IMemberCommunity[];
}

@Schema({ timestamps: true })
export class Community extends Document implements ICommunity {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  image: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Users' })
  userId: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Member' }] })
  members: Member[]; // Array of Member IDs
}

export const CommunitySchema = SchemaFactory.createForClass(Community);
