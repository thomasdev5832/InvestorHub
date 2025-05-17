import { Module } from '@nestjs/common';
import { PoolService } from './pool.service';
import { RedisService } from '../../redis/redis.service';
import { SubgraphMetricsService } from '../../metrics/subgraph/subgraph-metrics.service';
import { BlockHelper } from '../helpers/block.helper';
import { GraphQLClient } from 'graphql-request';

@Module({
  providers: [
    PoolService,
    RedisService,
    SubgraphMetricsService,
    BlockHelper,
    {
      provide: 'GRAPHQL_CLIENT',
      useFactory: () => {
        return new GraphQLClient(process.env.SUBGRAPH_URL || '');
      },
    },
  ],
  exports: [PoolService],
})
export class PoolModule {} 