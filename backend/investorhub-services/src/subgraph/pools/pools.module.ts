import { Module } from '@nestjs/common';
import { PoolController } from './pool.controller';
import { PoolService } from './pool.service';
import { RedisModule } from '../../redis/redis.module';
import { GraphQLModule } from '../../graphql/graphql.module';
import { MetricsModule } from 'src/metrics/subgraph/subgraph-metrics.module';

@Module({
  imports: [RedisModule, GraphQLModule, MetricsModule],
  controllers: [PoolController],
  providers: [PoolService],
  exports: [PoolService],
})
export class PoolsModule {} 