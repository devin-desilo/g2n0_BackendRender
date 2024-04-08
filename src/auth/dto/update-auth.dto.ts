import { PartialType } from '@nestjs/swagger';
import { CreateAuthDto, CreateUserSecondDto } from './create-auth.dto';

export class UpdateAuthDto extends PartialType(CreateAuthDto) {}

export class UpdateUserSecondDto extends PartialType(CreateUserSecondDto) {}
