import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsString,
  ValidateNested
} from 'class-validator';

class EventDto {
  @ApiProperty()
  @IsDateString()
  date: Date;

  @ApiProperty()
  @IsString()
  time: string;
}

class PostJoinDto {
  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  id: string;

  @ApiProperty({ enum: ['User', 'Community', 'Collaboration'] })
  @IsNotEmpty()
  type: 'User' | 'Community' | 'Collaboration';
}


export class CreatePostDto {
  @ApiProperty()
  @IsString()
  title: string; // Added title field

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsBoolean()
  is_mark_question: boolean;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Select a file to upload',
  })
  uploadMedia: any;

  @ApiProperty({ type: [EventDto] }) // Updated events property
  @IsArray()
  events: any;

  @ApiProperty({ type: [PostJoinDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PostJoinDto)
  postJoin: any;
}
