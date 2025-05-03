import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MetricsModule } from 'src/metrics/subgraph/metrics.module';
import { PoolController } from './pools/pool.controller';
import { PoolService } from './pools/pool.service';
import { RedisService } from 'src/redis/redis.service';
import { GraphQLModule } from 'src/graphql/graphql.module';
import { PoolsModule } from './pools/pools.module';
import { PositionsModule } from './positions/positions.module';
import { BlockHelper } from './helpers/block.helper';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MetricsModule,
    GraphQLModule,
    PoolsModule,
    PositionsModule,
  ],
  controllers: [PoolController],
  providers: [PoolService, RedisService, BlockHelper],
  exports: [
    PoolsModule,
    PositionsModule,
    BlockHelper,
  ],
})
export class SubgraphModule { }
