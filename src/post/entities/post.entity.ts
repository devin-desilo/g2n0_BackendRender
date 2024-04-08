import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Comment } from '@src/comments/entities/comment.entity';
import { Document, Types } from 'mongoose';

class Event {
  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ type: String, required: true })
  time: string;
}

export enum PostJoinType {
  USER = 'User',
  COMMUNITY = 'Community',
  COLLABORATION = 'Collaboration',
}

@Schema()
export class PostJoin extends Document {
  @Prop({ type: Types.ObjectId, required: true })
  id: Types.ObjectId;

  @Prop({ enum: Object.values(PostJoinType), required: true })
  type: PostJoinType;

  // Reference to User schema
  @Prop({ type: Types.ObjectId, ref: 'Users' })
  user: Types.ObjectId;

  // Reference to Community schema
  @Prop({ type: Types.ObjectId, ref: 'Community' })
  community: Types.ObjectId;

  // Reference to Collaboration schema
  @Prop({ type: Types.ObjectId, ref: 'Collaboration' })
  collaboration: Types.ObjectId;
}

export const PostJoinSchema = SchemaFactory.createForClass(PostJoin);

@Schema()
export class Post extends Document {
  @Prop({ type: Types.ObjectId, required: true, ref: 'Users' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  is_mark_question: boolean;

  @Prop({ required: true })
  uploadMedia: string;

  @Prop([{ type: Types.ObjectId, ref: 'Users' }])
  likes: Types.ObjectId[];

  @Prop({ type: [Event], required: true })
  events: Event[];

  @Prop({ type: [PostJoin] })
  postJoin: PostJoin[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Comment' }] })
  comments: Comment[];
}

export const PostSchema = SchemaFactory.createForClass(Post);
