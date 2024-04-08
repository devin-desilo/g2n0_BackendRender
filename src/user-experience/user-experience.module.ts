import { Module } from '@nestjs/common';
import { UserExperienceService } from './user-experience.service';
import { UserExperienceController } from './user-experience.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserExperience,
  UserExperienceSchema,
} from './entities/user-experience.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserExperience.name, schema: UserExperienceSchema },
    ]),
  ],
  controllers: [UserExperienceController],
  providers: [UserExperienceService],
})
export class UserExperienceModule {}
