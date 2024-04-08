import { PartialType } from '@nestjs/swagger';
import { CreateClimateVaultDto } from './create-climate-vault.dto';

export class UpdateClimateVaultDto extends PartialType(CreateClimateVaultDto) {}
