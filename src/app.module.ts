import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthModule } from 'src/api/auth/auth.module';
import { UserModule } from 'src/api/user/user.module';
import { TaskModule } from 'src/api/task/task.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGO_DB_URL'),
      }),
    }),
    AuthModule,
    UserModule,
    TaskModule,
  ],
})
export class AppModule {}
