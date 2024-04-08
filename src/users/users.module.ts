import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Users } from '@src/config/db/schemas';
import { UserSchema } from '@src/config/db/schemas/user.model';
import { UserExperienceModule } from '@src/user-experience/user-experience.module';
import {
  UserExperience,
  UserExperienceSchema,
} from '@src/user-experience/entities/user-experience.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserExperience.name, schema: UserExperienceSchema },
      { name: Users.name, schema: UserSchema },
    ]),
    UserExperienceModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
