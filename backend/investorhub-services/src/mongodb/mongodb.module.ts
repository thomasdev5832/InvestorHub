import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { MongoDBService } from './mongodb.service';
import { TokenModule } from './token.module';
import { MigrationsModule } from './migrations/migrations.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        dbName: configService.get<string>('MONGODB_DATABASE'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        minPoolSize: 5,
      }),
      inject: [ConfigService],
    }),
    TokenModule,
    MigrationsModule,
  ],
  providers: [MongoDBService],
  exports: [MongoDBService, TokenModule],
})
export class MongoDBModule {} 