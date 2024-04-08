import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { FirebaseController } from './firebase.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from 'joi';
import { FirebaseModule } from 'nestjs-firebase';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({}),
    }),
    FirebaseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: () => {
        return {
          googleApplicationCredential: './firebase.config.json',
        };
      },
    }),
  ],
  controllers: [FirebaseController],
  providers: [FirebaseService],
  exports: [FirebaseService],
})
export class Firebase {}
