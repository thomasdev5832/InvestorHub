import { Module } from '@nestjs/common';
import { PoolController } from './pool.controller';
import { PoolService } from './pool.service';
import { RedisModule } from '../../redis/redis.module';
import { GraphQLModule } from '../../graphql/graphql.module';

@Module({
  imports: [RedisModule, GraphQLModule],
  controllers: [PoolController],
  providers: [PoolService],
  exports: [PoolService],
})
export class PoolsModule {} 