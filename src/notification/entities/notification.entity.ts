import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum INotificationStatus {
  READ = 'read',
  UNREAD = 'unread',
}

@Schema()
export class Notification extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: Object, default: null })
  payload: Record<string, any>;

  @Prop({
    required: true,
    enum: INotificationStatus,
    default: INotificationStatus.UNREAD,
  })
  status: INotificationStatus;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
