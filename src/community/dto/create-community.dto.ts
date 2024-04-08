import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateCommunityDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;

  // Add the image field
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Select a file to upload', // Add a description for the file input field
    required: false,
  })
  image: any; // This will be handled by multer
}
