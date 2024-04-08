// member.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface ICollaborationMemberCommunity extends Document {
  collaborationId: string;
  memberId: Types.ObjectId;
  type: string;
}

@Schema()
export class CollaborationMember
  extends Document
  implements ICollaborationMemberCommunity
{
  @Prop({ required: true })
  collaborationId: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Users' }) // Reference to Users collection
  memberId: Types.ObjectId;

  @Prop({ required: true })
  type: string;
}

export const CollaborationMemberSchema =
  SchemaFactory.createForClass(CollaborationMember);
