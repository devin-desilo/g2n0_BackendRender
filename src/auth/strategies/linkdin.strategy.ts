import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { UsersService } from '@src/users/users.service';
import { Strategy } from 'passport-linkedin-oauth2';

@Injectable()
export class LinkdinStrategy extends PassportStrategy(Strategy, 'linkdin') {
  constructor(private readonly userService: UsersService) {
    super({
      clientID: process.env.LINKDIN_CLIENT_ID,
      clientSecret: process.env.LINKDIN_CLIENT_SECRET,
      callbackURL: process.env.LINKDIN_CALLBACK_URL,
      scope: ['email', 'profile', 'openid', 'w_member_social'],
      state: true,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    console.log(profile);

    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken,
      refreshToken,
    };
    console.log(user);
  }
}
