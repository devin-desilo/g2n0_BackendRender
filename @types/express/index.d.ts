import { IUser } from '@app/common';

declare global {
  namespace Express {
    interface User extends IUser {}
    interface Request {
      id: string;
      language?: string;
    }
  }
}
