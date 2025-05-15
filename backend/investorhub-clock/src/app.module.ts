import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CronModule } from './cron/cron.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CronModule,
  ],
})
export class AppModule {}
