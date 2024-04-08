import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './entities/post.entity';
import {
  Community,
  CommunitySchema,
} from '@src/community/entities/community.entity';
import {
  Collaboration,
  CollaborationSchema,
} from '@src/collaboration/entities/collaboration.entity';
import { Comment, CommentSchema } from '@src/comments/entities/comment.entity';
import { NotificationService } from '@src/notification/notification.service';
import { NotificationModule } from '@src/notification/notification.module';
import {
  NotificationSchema,
  Notification,
} from '@src/notification/entities/notification.entity';
import { Users } from '@src/config/db/schemas';
import { UserSchema } from '@src/config/db/schemas/user.model';
import { Firebase } from '@src/firebase/firebase.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Community.name, schema: CommunitySchema },
      { name: Collaboration.name, schema: CollaborationSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: Users.name, schema: UserSchema },
    ]),
    NotificationModule,
    Firebase,
  ],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
