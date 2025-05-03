import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { RedisModule } from '../redis/redis.module';
import { GraphQLModule } from '../graphql/graphql.module';

@Module({
  imports: [
    TerminusModule,
    RedisModule,
    GraphQLModule,
  ],
  controllers: [HealthController],
})
export class HealthModule {} 