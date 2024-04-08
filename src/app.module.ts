import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { validate } from './config';
import { JwtService } from '@nestjs/jwt';
import { UserExperienceModule } from './user-experience/user-experience.module';
import { CommunityModule } from './community/community.module';
import { CollaborationModule } from './collaboration/collaboration.module';
import { PostModule } from './post/post.module';
import { CommentsModule } from './comments/comments.module';
import { ClimateVaultModule } from './climate-vault/climate-vault.module';
import { ClimateVaultService } from './climate-vault/climate-vault.service';
import {
  ClimateVault,
  ClimateVaultSchema,
} from './climate-vault/entities/climate-vault.entity';
import {
  Category,
  CategorySchema,
} from './climate-vault/entities/category.entity';
import { NotificationModule } from './notification/notification.module';
import { Firebase } from './firebase/firebase.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validate,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get('MONGO_URL');
        const database = configService.get('MONGO_DATABASE');

        return {
          uri: uri,
          dbName: database,
        };
      },
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: ClimateVault.name, schema: ClimateVaultSchema },
      { name: Category.name, schema: CategorySchema },
    ]),

    AuthModule,
    UsersModule,
    UserExperienceModule,
    CommunityModule,
    CollaborationModule,
    PostModule,
    CommentsModule,
    ClimateVaultModule,
    NotificationModule,
    Firebase,
  ],
  controllers: [AppController],
  providers: [AppService, JwtService, ClimateVaultService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly climateVaultSeeder: ClimateVaultService) {}

  async onModuleInit() {
    await this.climateVaultSeeder.seed(); // Seed ClimateVault collection
  }
}
