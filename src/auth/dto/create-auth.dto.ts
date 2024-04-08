import { ApiProperty } from '@nestjs/swagger';
import { CreateUserExperienceDto } from '@src/user-experience/dto/create-user-experience.dto';
import {
  IsNotWhitespace,
  IsPasswordMatching,
} from '@src/utils/custom-password.validator';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ default: 'sunilahir880@gmail.com' })
  @IsNotEmpty()
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({ default: 'Password@123' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    enum: ['iOS', 'Android', 'WEB'],
    default: 'WEB',
    required: false,
  })
  @IsOptional()
  @IsIn(['iOS', 'Android', 'WEB'], { message: 'Invalid platform' })
  platform?: string;

  @ApiProperty({ default: 'device_token_here', required: false })
  @IsOptional()
  @IsString()
  device_token?: string;
}

export class RegisterUser {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsIn(['1', '2'], { message: 'validation.IsIn' })
  roleId: string;
}

export class LinkdinRegisterUser {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsIn(['1', '2'], { message: 'validation.IsIn' })
  roleId: string;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(20)
  first_name: string;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  photo: string;
}

export class VerifyOtpDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  @IsNotWhitespace({ message: 'Password cannot consist of only spaces.' })
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  @IsNotWhitespace({ message: 'Password cannot consist of only spaces.' })
  @IsPasswordMatching('password', { message: 'Passwords do not match.' })
  confirmPassword: string;
}

export class ResetPasswordDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsString()
  password: string;

  @IsString()
  reset_password_token: string;
}

export class ResendOtpDto {
  phoneNumber: number;
  userId: string;
}

export class CreateUserSecondDto {
  @ApiProperty({ required: false })
  @IsOptional()
  id: string;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(20)
  first_name: string;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  location: string;

  @ApiProperty({ required: false })
  @IsOptional()
  iam: string;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  age: string;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  gender: string;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  levelEducation: string;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  industry: string;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  areaOfInterest: string;

  @ApiProperty({ required: false })
  @IsOptional()
  isActive?: boolean;

  // Add the image field
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Select a file to upload', // Add a description for the file input field
    required: false,
  })
  profileImage: any; // This will be handled by multer

  @ApiProperty({
    type: () => [CreateUserExperienceDto],
    description: 'JSON string representing an array of objects',
  })
  @IsNotEmpty()
  @IsString()
  @Type(() => CreateUserExperienceDto)
  experience: string;
}

export class CreateUsersDto {
  @ApiProperty({ required: false })
  @IsOptional()
  id: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(20)
  first_name: string;

  @ApiProperty()
  @IsNotEmpty()
  last_name: string;

  @ApiProperty()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ required: false })
  @IsOptional()
  iam: string;

  @ApiProperty()
  @IsNotEmpty()
  age: string;

  @ApiProperty()
  @IsNotEmpty()
  gender: string;

  @ApiProperty()
  @IsNotEmpty()
  levelEducation: string;

  @ApiProperty()
  @IsNotEmpty()
  industry: string;

  @ApiProperty()
  @IsNotEmpty()
  areaOfInterest: string;
}

export class LoginDto {
  email: string;
  password: string;
}

export class CreateAuthDto {}
