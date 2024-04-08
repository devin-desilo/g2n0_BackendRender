import { Module } from '@nestjs/common';
import { ClimateVaultService } from './climate-vault.service';
import { ClimateVaultController } from './climate-vault.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ClimateVault,
  ClimateVaultSchema,
} from './entities/climate-vault.entity';
import { Category, CategorySchema } from './entities/category.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ClimateVault.name, schema: ClimateVaultSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  controllers: [ClimateVaultController],
  providers: [ClimateVaultService],
})
export class ClimateVaultModule {}
