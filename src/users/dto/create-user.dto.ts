import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsOptional()
  password: string;

  @ApiProperty()
  @IsOptional()
  verified: boolean;

  @ApiProperty()
  @IsOptional()
  otp: string;

  @ApiProperty()
  @IsOptional()
  isActive: boolean;
}
