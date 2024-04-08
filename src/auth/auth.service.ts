import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@src/users/users.service';
import { EmailService } from '@src/utils/email.service';
import * as fs from 'fs';
import jwt from 'jsonwebtoken';
import {
  LinkdinRegisterUser,
  LoginUserDto,
  RegisterUser,
  ResendOtpDto,
  ResetPasswordDto,
  VerifyOtpDto,
} from './dto/create-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async authenticate(credentials: LoginUserDto): Promise<any> {
    const checkUser = await this.usersService.authenticate(credentials);
    if (!checkUser) {
      throw Error('Username or Password are invalid');
    }
    if (checkUser.isActive === false) {
      throw Error('This user is blocked. Please contact admin');
    }
    const token = jwt.sign(
      checkUser,
      this.configService.get<string>('SECRET'),
      {
        expiresIn: '1d',
      },
    );
    return { ...checkUser, token };
  }

  async register(credentials: RegisterUser): Promise<any> {
    const check = await this.usersService.getByWhere({
      email: credentials.email,
    });
    if (check) {
      if (check.verified) {
        throw Error('Your email has been already registered');
      }
      const token = await this.sendEmail(check.id, check.email);
      console.log('token', token);
      if (token) {
        await this.usersService.update(check.id, { otp: token });
      }
      return check;
    }
    const user = await this.usersService.create(credentials);
    if (!user) {
      throw new Error('Invalid User Detail');
    }
    await this.sendEmail(user._id, user.email);
    return user;
  }

  async linkdinRegister(credentials: LinkdinRegisterUser): Promise<any> {
    const checkUser = await this.usersService.getByWhere({
      email: credentials.email,
    });
    if (checkUser) {
      const token = jwt.sign(
        checkUser.toJSON(),
        this.configService.get<string>('SECRET'),
        {
          expiresIn: '1d',
        },
      );
      return { ...checkUser, token };
    }
    const user = await this.usersService.createLinkdin(credentials);
    if (!user) {
      throw new Error('Invalid User Detail');
    }
    // await this.sendEmail(user._id, user.email);
    const token = jwt.sign(user, this.configService.get<string>('SECRET'), {
      expiresIn: '1d',
    });
    return { ...user.toJSON(), token };
  }

  async verifyEmail(credentials: VerifyOtpDto) {
    const checkToken = await this.verifyToken(credentials.token);
    if (checkToken && checkToken.exp) {
      const expirationTimestamp = checkToken.exp;
      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (currentTimestamp >= expirationTimestamp) {
        throw new Error('Token has been expired');
      }
    }

    const user = await this.usersService.findOne(checkToken.user_id);
    if (!user) {
      throw Error('user Not found');
    }
    if (checkToken?.user_id === checkToken.user_id) {
      await this.usersService.update(checkToken.user_id, {
        verified: true,
        password: credentials.password,
        isActive: true,
      });
      const response = await this.usersService.findOne(checkToken.user_id);
      return response;
    }
    throw Error('Token hasn`t verified');
  }

  async resendOtp(credentials: ResendOtpDto) {
    const user = await this.usersService.getByWhere({
      id: credentials.userId,
    });
    if (!user) {
      throw Error('user Not found');
    }
    return user;
  }

  async generateToken(user_id: string, email: string): Promise<string> {
    const payload = {
      user_id: user_id,
      email: email,
    };
    const token = jwt.sign(payload, this.configService.get<string>('SECRET'), {
      expiresIn: '1d',
    });

    return token;
  }

  verifyToken(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        this.configService.get<string>('SECRET'),
        (err, decoded) => {
          if (err) {
            reject(err);
          } else {
            resolve(decoded);
          }
        },
      );
    });
  }

  async sendEmail(id: string, email: string) {
    try {
      const token: string = await this.generateToken(id, email);
      const link = `${this.configService.get<string>('FRONT_URL')}signup?token=${token}`;
      const to = email;
      const subject = 'Verify Email Address';

      const templateFile = fs.readFileSync(
        './src/mail/verificationMail.html',
        'utf8',
      );
      const message = templateFile.replace('{{ link }}', link);
      await this.emailService.sendMail(to, subject, message, true);

      return token;
    } catch (error) {
      return false;
    }
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.getByWhere({ email });
    if (!user) {
      throw Error('Invalid Email Address');
    }
    const token: string = await this.generateToken(user.id, email);
    user.reset_password_token = token;
    user.save();
    const link = `${this.configService.get<string>(
      'FRONT_URL',
    )}resetPassword?token=${token}`;
    const to = email;
    const subject = 'Reset Password Email';
    const message = `This is a reset password mail :${link}`;
    await this.emailService.sendMail(to, subject, message);
    return user;
  }

  async resetPassword(data: ResetPasswordDto): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    try {
      const decoded: any = jwt.verify(
        data.reset_password_token,
        this.configService.get<string>('SECRET'),
      );
      const response = this.isTokenNotExpired(new Date(decoded.exp * 1000));
      if (!response) {
        throw Error('Your token has been expired!');
      }
      const user = await this.usersService.findOne(decoded.user_id);
      if (!user) {
        throw Error('Invalid Token');
      }
      await this.usersService.update(user._id, {
        password: data.password,
      });
      // user.save();
      return true;
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      } else {
        throw error; // Re-throw other errors
      }
    }
  }

  isTokenNotExpired(expirationDate: Date | undefined): boolean {
    return expirationDate ? expirationDate > new Date() : false;
  }
}
