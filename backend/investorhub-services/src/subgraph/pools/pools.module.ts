import { Module } from '@nestjs/common';
import { PoolController } from './pool.controller';
import { PoolService } from './pool.service';
import { RedisModule } from '../../redis/redis.module';
import { GraphQLModule } from '../../graphql/graphql.module';
import { BlockHelper } from '../helpers/block.helper';
import { ConfigModule } from '@nestjs/config';
import { MetricsModule } from 'src/metrics/subgraph/metrics.module';

@Module({
  imports: [
    RedisModule, 
    GraphQLModule, 
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MetricsModule
  ],
  controllers: [PoolController],
  providers: [PoolService, BlockHelper],
  exports: [PoolService],
})
export class PoolsModule {} 