import { Controller, Get, Inject } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { RedisService } from '../redis/redis.service';
import { GraphQLClient } from 'graphql-request';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private redis: RedisService,
    @Inject('GRAPHQL_CLIENT')
    private readonly graph: GraphQLClient,
  ) {}

  @Get()
  @HealthCheck()
  @ApiExcludeEndpoint()
  async check() {
    return this.health.check([
      // Check Redis connection
      async () => {
        try {
          const redisClient = await this.redis.getClient();
          await redisClient.ping();
          return {
            redis: {
              status: 'up',
            },
          };
        } catch (error) {
          console.error('Redis health check failed:', error);
          return {
            redis: {
              status: 'down',
              error: error.message,
            },
          };
        }
      },
      // Check Subgraph connection
      async () => {
        try {
          // Use a simple query that should work with most subgraphs
          await this.graph.request('{ _meta { block { number } } }');
          return {
            subgraph: {
              status: 'up',
            },
          };
        } catch (error) {
          console.error('Subgraph health check failed:', error);
          return {
            subgraph: {
              status: 'down',
              error: error.message,
            },
          };
        }
      },
    ]);
  }
} 