import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  CollaborationMember,
  ICollaborationMemberCommunity,
} from './member.entity';
import { Document, Types } from 'mongoose';

export interface ICollaboration extends Document {
  userId: string;
  name: string;
  image: string;
  description: string;
  isActive: boolean;
  members: ICollaborationMemberCommunity[];
}

@Schema({ timestamps: true })
export class Collaboration extends Document implements ICollaboration {
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

  @Prop({ type: [{ type: Types.ObjectId, ref: 'CollaborationMember' }] })
  members: CollaborationMember[]; // Array of Member IDs
}

export const CollaborationSchema = SchemaFactory.createForClass(Collaboration);