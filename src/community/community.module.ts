import { Module } from '@nestjs/common';
import { CommunityService } from './community.service';
import { CommunityController } from './community.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Community, CommunitySchema } from './entities/community.entity';
import { Member, MemberSchema } from './entities/member.entity';
import { UserSchema, Users } from '@src/config/db/schemas/user.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Community.name, schema: CommunitySchema },
      { name: Member.name, schema: MemberSchema },
      { name: Users.name, schema: UserSchema },
    ]),
  ],
  controllers: [CommunityController],
  providers: [CommunityService],
})
export class CommunityModule {}
