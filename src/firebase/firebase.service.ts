import { Injectable, Logger } from '@nestjs/common';
import { TokenMessage } from 'firebase-admin/lib/messaging/messaging-api';
import { FirebaseAdmin, InjectFirebaseAdmin } from 'nestjs-firebase';

@Injectable()
export class FirebaseService {
  private readonly logger: Logger = new Logger(FirebaseService.name);
  constructor(
    @InjectFirebaseAdmin() private readonly firebase: FirebaseAdmin,
  ) {}
  postNotification(
    to: string,
    body: string,
    { action, data }: { action: string; data: Record<string, any> },
    title?: string,
  ) {
    if (to == undefined || to.length == 0) {
      this.logger.log('Token cannot be empty');
      return;
    }
    const payload: TokenMessage = {
      token: to,
      notification: {
        title: title,
        body,
      },
      data: {
        body,
        action,
        meta: JSON.stringify(data),
      },
    };

    this.logger.log(payload);
    return this.firebase.messaging
      .send(payload)
      .then(() => {
        return Promise.resolve(payload);
      })
      .catch((error) => {
        return Promise.reject(error);
      });
  }
}
