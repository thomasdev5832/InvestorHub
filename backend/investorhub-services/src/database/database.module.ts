import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        dbName: configService.get<string>('MONGODB_DATABASE'),
        maxPoolSize: 10,
        minPoolSize: 5,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
  ],
  exports: [
  ],
})
export class DatabaseModule {} 