import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CronModule } from './cron/cron.module';
import { PoolModule } from './subgraph/pools/pool.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CronModule,
    PoolModule,
  ],
})
export class AppModule {}
