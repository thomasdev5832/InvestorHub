import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PoolModule } from './subgraph/pools/pool.module';
import { MigrationsModule } from './database/migrations/migrations.module';
import { CronModule } from './cron/cron.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PoolModule,
    MigrationsModule,
    CronModule,
  ],
})
export class AppModule {}
