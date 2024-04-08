import {
  IsNumber,
  IsString,
  IsEnum,
  IsOptional,
  IsObject,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { INotificationStatus } from '../entities/notification.entity';

export class CreateNotificationDto {
  @ApiProperty()
  @IsNumber()
  userId: number;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  payload?: Record<string, any>;

  @ApiProperty({
    enum: INotificationStatus,
    default: INotificationStatus.UNREAD,
  })
  @IsEnum(INotificationStatus)
  status: INotificationStatus;
}
