import { Module } from '@nestjs/common';
import { PositionsController } from './positions.controller';
import { PositionsService } from './positions.service';
import { RedisModule } from '../../redis/redis.module';
import { GraphQLModule } from '../../graphql/graphql.module';
import { MetricsModule } from '../../metrics/subgraph/metrics.module';

@Module({
  imports: [
    RedisModule,
    GraphQLModule,
    MetricsModule,
  ],
  controllers: [PositionsController],
  providers: [PositionsService],
  exports: [PositionsService],
})
export class PositionsModule {} 