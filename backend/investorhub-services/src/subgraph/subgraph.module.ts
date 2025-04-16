import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PoolController } from './pools/pool.controller';
import { PoolService } from './pools/pool.service';
import { RedisService } from 'src/redis/redis.service';
import { GraphQLModule } from 'src/graphql/graphql.module';
import { PoolsModule } from './pools/pools.module';
import { PositionsModule } from './positions/positions.module';
import { MetricsModule } from 'src/metrics/subgraph/subgraph-metrics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule,
    PoolsModule,
    PositionsModule,
    MetricsModule,
  ],
  controllers: [PoolController],
  providers: [PoolService, RedisService],
  exports: [
    PoolsModule,
    PositionsModule,
  ],
})
export class SubgraphModule { }
