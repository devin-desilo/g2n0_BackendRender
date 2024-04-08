import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Notification,
  NotificationSchema,
} from './entities/notification.entity';
// import { Firebase } from '@src/firebase/firebase.module';
import { Users } from '@src/config/db/schemas';
import { UserSchema } from '@src/config/db/schemas/user.model';
import { Firebase } from '@src/firebase/firebase.module';
import { FirebaseService } from '@src/firebase/firebase.service';
// import { FirebaseService } from '@src/firebase/firebase.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: Users.name, schema: UserSchema },
    ]),
    Firebase,
  ],
  controllers: [NotificationController],
  providers: [NotificationService, FirebaseService],
  exports: [NotificationService],
})
export class NotificationModule {}
