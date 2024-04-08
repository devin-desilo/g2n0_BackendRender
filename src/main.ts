import { RequestMethod, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import promBundle from 'express-prom-bundle';
import session from 'express-session';
import { AppModule } from './app.module';
import { jwtConstants } from './auth/constants';
import { GlobalExceptionFilter } from './utils/multer-validation.exception';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
    bodyParser: true,
  });
  app.use(
    session({
      secret: jwtConstants.secret,
      resave: false,
      saveUninitialized: false,
    }),
  );
  app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);

  app.disable('x-powered-by');

  app.useBodyParser('json', { limit: '50mb' });
  app.useBodyParser('urlencoded', { limit: '80mb', extended: true });
  // app.useGlobalFilters(new MulterValidationExceptionFilter());
  // app.useGlobalFilters(new GlobalExceptionFilter());

  // app.use(fileUpload());

  app.enableVersioning({
    type: VersioningType.URI,
  });
  useContainer(app.select(AppModule), { fallbackOnErrors: false });
  app.setGlobalPrefix('/api/v1', {
    exclude: [{ path: 'metrics', method: RequestMethod.GET }],
  }); 
  const metricsMiddleware = promBundle({
    includeMethod: true,
    includePath: true,
  });
  app.use(metricsMiddleware);

  // Create a Swagger document options
  const options = new DocumentBuilder()
    .setTitle('GET2NET API')
    .setDescription('API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  // Generate the Swagger document
  const document = SwaggerModule.createDocument(app, options);
  // Serve the Swagger API documentation at '/api' endpoint
  SwaggerModule.setup('/api-docs', app, document, { useGlobalPrefix: true });

  const configService: ConfigService = app.get<ConfigService>(ConfigService);

  await app.listen(configService.get<number>('PORT') ?? 3000);
}
bootstrap();
