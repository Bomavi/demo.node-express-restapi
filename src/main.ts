import * as cookieParser from 'cookie-parser';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { setupSwagger } from 'src/shared/utils/swagger.util';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.use(cookieParser());

  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: config.getOrThrow<string>('ALLOWED_ORIGINS').split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Authorization', 'Content-Type', 'X-Api-Key'],
    exposedHeaders: ['Set-Cookie'],
  });

  setupSwagger(app);

  await app.listen(config.getOrThrow<string>('PORT'));
}

void bootstrap();
