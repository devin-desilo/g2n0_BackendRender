import { Module } from '@nestjs/common';
import { CollaborationService } from './collaboration.service';
import { CollaborationController } from './collaboration.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Collaboration,
  CollaborationSchema,
} from './entities/collaboration.entity';
import {
  CollaborationMember,
  CollaborationMemberSchema,
} from './entities/member.entity';
import { Users, UserSchema } from '@src/config/db/schemas/user.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Collaboration.name, schema: CollaborationSchema },
      { name: CollaborationMember.name, schema: CollaborationMemberSchema },
      { name: Users.name, schema: UserSchema },
    ]),
  ],
  controllers: [CollaborationController],
  providers: [CollaborationService],
})
export class CollaborationModule {}
