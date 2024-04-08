import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Users } from '@src/config/db/schemas';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  serializeUser(user: Users, done: (err: Error, user: Users) => void): any {
    done(null, user);
  }

  deserializeUser(
    payload: Users,
    done: (err: Error, payload: any) => void,
  ): any {
    done(null, payload);
  }
}
