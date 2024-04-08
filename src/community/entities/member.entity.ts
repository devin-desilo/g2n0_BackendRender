// member.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface IMemberCommunity extends Document {
  communityId: string;
  memberId: Types.ObjectId;
  type: string;
  user: any;
}

@Schema()
export class Member extends Document implements IMemberCommunity {
  @Prop({ required: true })
  communityId: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Users' }) // Reference to Users collection
  memberId: Types.ObjectId;

  @Prop({ required: true })
  type: string;

  @Prop({ type: Types.ObjectId, ref: 'Users' })  // Reference to Users collection
  user: Types.ObjectId;
}

export const MemberSchema = SchemaFactory.createForClass(Member);
