import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RedisService } from '../redis/redis.service';
import { GraphQLClient } from 'graphql-request';
import { Logger } from '@nestjs/common';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(
    private readonly redis: RedisService,
    @Inject('GRAPHQL_CLIENT')
    private readonly graph: GraphQLClient,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Check service health' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  async check() {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        redis: 'ok',
        subgraph: 'ok',
      },
    };

    try {
      const redisClient = await this.redis.getClient();
      await redisClient.ping();
    } catch (error) {
      this.logger.error(`Redis health check failed: ${error.message}`);
      health.services.redis = 'error';
      health.status = 'error';
    }

    try {
      // Simple query to check subgraph health
      await this.graph.request('{ _meta { block { number } } }');
    } catch (error) {
      this.logger.error(`Subgraph health check failed: ${error.message}`);
      health.services.subgraph = 'error';
      health.status = 'error';
    }

    if (health.status === 'error') {
      throw new Error('Service health check failed');
    }

    return health;
  }
} 