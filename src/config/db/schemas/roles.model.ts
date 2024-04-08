import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export interface IRole extends Document {
  name: string;
  isActive: boolean;
  slug: string;
}

@Schema()
export class Role extends Document implements IRole {
  @Prop({ required: true })
  name: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: true })
  slug: string;
  
}

export const RoleSchema = SchemaFactory.createForClass(Role);
