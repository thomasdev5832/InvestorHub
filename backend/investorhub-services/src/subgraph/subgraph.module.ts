import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MetricsModule } from 'src/metrics/subgraph/metrics.module';
import { PoolController } from './pools/pool.controller';
import { PoolService } from './pools/pool.service';
import { RedisService } from 'src/redis/redis.service';
import { GraphQLModule } from 'src/graphql/graphql.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MetricsModule,
    GraphQLModule
  ],
  controllers: [PoolController],
  providers: [PoolService, RedisService],
})
export class SubgraphModule { }
