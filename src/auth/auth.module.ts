import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { ServeStaticModule } from '@nestjs/serve-static';
import { Users } from '@src/config/db/schemas';
import { UserSchema } from '@src/config/db/schemas/user.model';
import {
  UserExperience,
  UserExperienceSchema,
} from '@src/user-experience/entities/user-experience.entity';
import { UsersModule } from '@src/users/users.module';
import { UsersService } from '@src/users/users.service';
import { EmailService } from '@src/utils/email.service';
import { join } from 'path';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { jwtConstants } from './constants';
import { LinkdinStrategy } from './strategies/linkdin.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../', 'uploads'), // Specify the path to the directory where the uploaded images are stored
      serveRoot: '/uploads', // Specify the URL path prefix for serving the static files
    }),
    JwtModule.register({
      secret: jwtConstants.secret, // Replace with your own secret key
      signOptions: { expiresIn: '1d' }, // Token expiration time
    }),
    MongooseModule.forFeature([
      { name: UserExperience.name, schema: UserExperienceSchema },
      { name: Users.name, schema: UserSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersService,
    LocalStrategy,
    EmailService,
    LinkdinStrategy,
  ],
})
export class AuthModule {}
