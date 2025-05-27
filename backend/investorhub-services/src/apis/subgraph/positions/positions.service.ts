import { Injectable, Logger, NotFoundException, BadGatewayException, ServiceUnavailableException, Inject } from '@nestjs/common';
import { RedisService } from '../../../redis/redis.service';
import { GraphQLClient } from 'graphql-request';
import { PositionDto, PositionsResponseDto } from './dto/position.dto';
import { SubgraphMetricsService } from '../../../metrics/subgraph/subgraph-metrics.service';

const POSITIONS_QUERY = `
  query GetPositions($owner: String!) {
    positions(where: { owner: $owner }) {
      id
      token0 {
        id
        symbol
        name
        decimals
      }
      token1 {
        id
        symbol
        name
        decimals
      }
      liquidity
      collectedFeesToken0
      collectedFeesToken1
      pool {
        id
        token0Price
        token1Price
        feeTier
      }
    }
  }
`;

interface RawPosition {
  id: string;
  token0: {
    id: string;
    symbol: string;
    name: string;
    decimals: string;
  };
  token1: {
    id: string;
    symbol: string;
    name: string;
    decimals: string;
  };
  liquidity: string;
  collectedFeesToken0: string;
  collectedFeesToken1: string;
  pool: {
    id: string;
    token0Price: string;
    token1Price: string;
    feeTier: string;
  };
}

interface RawPositionsResponse {
  positions: RawPosition[];
}

@Injectable()
export class PositionsService {
  private readonly logger = new Logger(PositionsService.name);
  private readonly CACHE_TTL = 300; // 5 minutes

  constructor(
    @Inject('GRAPHQL_CLIENT')
    private readonly graph: GraphQLClient,
    private readonly redis: RedisService,
    private readonly metrics: SubgraphMetricsService,
  ) {}

  private async fetchWithRetry<T>(operation: () => Promise<T>, retries = 3): Promise<T> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        this.logger.warn(`Attempt ${attempt} failed: ${error.message}`);
        if (attempt === retries) throw error;
        await new Promise(resolve => setTimeout(resolve, Math.min(1000 * attempt, 2000)));
      }
    }
    throw new Error('All retry attempts failed');
  }

  private calculatePositionMetrics(position: RawPosition): PositionDto {
    const token0Decimals = parseInt(position.token0.decimals);
    const token1Decimals = parseInt(position.token1.decimals);
    
    return {
      id: position.id,
      token0: {
        id: position.token0.id,
        symbol: position.token0.symbol,
        name: position.token0.name,
        decimals: token0Decimals,
      },
      token1: {
        id: position.token1.id,
        symbol: position.token1.symbol,
        name: position.token1.name,
        decimals: token1Decimals,
      },
      liquidity: position.liquidity,
      collectedFeesToken0: position.collectedFeesToken0,
      collectedFeesToken1: position.collectedFeesToken1,
      pool: {
        id: position.pool.id,
        token0Price: position.pool.token0Price,
        token1Price: position.pool.token1Price,
        feeTier: parseInt(position.pool.feeTier),
      },
    };
  }

  async getPositionsForWallet(walletAddress: string): Promise<PositionsResponseDto> {
    const cacheKey = `positions:${walletAddress.toLowerCase()}`;
    const startTime = Date.now();
    
    try {
      // Try to get from cache first
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        this.logger.debug(`Cache hit for wallet ${walletAddress}`);
        this.metrics.recordResponseTime('getPositions', Date.now() - startTime, 'cache_hit');
        return JSON.parse(cached);
      }

      // Fetch from subgraph if not in cache
      const response = await this.fetchWithRetry<RawPositionsResponse>(async () => {
        const result = await this.graph.request<RawPositionsResponse>(POSITIONS_QUERY, {
          owner: walletAddress.toLowerCase(),
        });
        
        if (!result || !result.positions) {
          throw new NotFoundException(`No positions found for wallet ${walletAddress}`);
        }
        
        return result;
      });

      // Transform and cache the response
      const transformedPositions = response.positions.map(this.calculatePositionMetrics);
      const responseDto: PositionsResponseDto = { positions: transformedPositions };
      await this.redis.set(cacheKey, JSON.stringify(responseDto), this.CACHE_TTL);
      
      this.metrics.recordResponseTime('getPositions', Date.now() - startTime, 'success');
      return responseDto;
    } catch (error) {
      this.logger.error(`Error fetching positions for wallet ${walletAddress}:`, error);
      
      if (error instanceof NotFoundException) {
        this.metrics.recordError('getPositions', 'not_found');
        throw error;
      }
      
      if (error.message.includes('Failed to fetch')) {
        this.metrics.recordError('getPositions', 'subgraph_error');
        throw new BadGatewayException('Failed to fetch data from subgraph');
      }
      
      this.metrics.recordError('getPositions', 'service_error');
      throw new ServiceUnavailableException('Service temporarily unavailable');
    }
  }
} 