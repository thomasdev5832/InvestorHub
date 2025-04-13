import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisService } from './redis/redis.service';
import { PoolController } from './subgraph/pools/pool.controller';
import { PoolService } from './subgraph/pools/pool.service';
import { GraphQLClientProvider } from './shared/services/subgraph.service';
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MetricsModule,
  ],
  controllers: [AppController, PoolController],
  providers: [AppService, PoolService, RedisService, GraphQLClientProvider],
})
export class AppModule { }
