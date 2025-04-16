import {
  Injectable,
  Logger,
  NotFoundException,
  Inject,
  BadGatewayException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
import { GraphQLClient } from 'graphql-request';
import { UniswapPoolResponseDto, UniswapPoolsResponseDto } from './dto/list-pools-response.dto';
import { SubgraphMetricsService } from '../../metrics/subgraph/subgraph-metrics.service';

const POOLS_QUERY = `
  query GetPools($token0: [String!], $token1: [String!]) {
    pools(where: { token0_in: $token0, token1_in: $token1 }) {
      id
      token0 {
        id
        symbol
      }
      token1 {
        id
        symbol
      }
      feeTier
      volumeUSD
      volumeUSD30d: volumeUSD
      tvlUSD: totalValueLockedUSD
      feesUSD
      createdAtTimestamp
    }
  }
`;

interface RawToken {
  id: string;
  symbol: string;
}

interface RawPool {
  id: string;
  token0: RawToken;
  token1: RawToken;
  feeTier: string;
  volumeUSD: string;
  volumeUSD30d: string;
  tvlUSD: string;
  feesUSD: string;
  createdAtTimestamp: string;
}

interface RawPoolsResponse {
  pools: RawPool[];
}

@Injectable()
export class PoolService {
  private readonly logger = new Logger(PoolService.name);
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

  private calculatePoolMetrics(pool: RawPool): UniswapPoolResponseDto {
    const tvl = parseFloat(pool.tvlUSD) || 0;
    const volume1d = parseFloat(pool.volumeUSD) || 0;
    const volume30d = parseFloat(pool.volumeUSD30d) || 0;
    const feeTier = parseInt(pool.feeTier) || 0;

    const apr24h = tvl > 0 ? ((volume1d * (feeTier / 10000)) / tvl) * 365 * 100 : 0;
    const volume1dToTVL = tvl > 0 ? volume1d / tvl : 0;
    
    return {
      id: pool.id,
      feeTier: pool.feeTier,
      volumeUSD: pool.volumeUSD,
      volumeUSD30d: pool.volumeUSD30d,
      tvlUSD: pool.tvlUSD,
      token0: pool.token0,
      token1: pool.token1,
      feesUSD: pool.feesUSD,
      createdAtTimestamp: pool.createdAtTimestamp,
      apr24h: apr24h.toFixed(2),
      volume1dToTVL: volume1dToTVL.toFixed(4),
    };
  }

  async fetchPoolsForTokenPair(token0: string, token1: string): Promise<UniswapPoolsResponseDto> {
    const cacheKey = `pools:${[token0, token1].sort().join('|')}`;
    const startTime = Date.now();
    
    try {
      // Try to get from cache first
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        this.logger.debug(`Cache hit for token pair: ${token0}, ${token1}`);
        this.metrics.recordResponseTime('getPools', Date.now() - startTime, 'cache_hit');
        return JSON.parse(cached);
      }

      // Fetch from subgraph if not in cache
      const response = await this.fetchWithRetry<RawPoolsResponse>(async () => {
        const result = await this.graph.request<RawPoolsResponse>(POOLS_QUERY, {
          token0: [token0, token1],
          token1: [token0, token1],
        });
        
        if (!result || !result.pools) {
          throw new NotFoundException(`No pools found for token pair: ${token0}, ${token1}`);
        }
        
        return result;
      });

      // Transform and cache the response
      const transformedPools = response.pools.map(this.calculatePoolMetrics);
      const responseDto: UniswapPoolsResponseDto = { 
        pools: transformedPools,
      };
      await this.redis.set(cacheKey, JSON.stringify(responseDto), this.CACHE_TTL);
      
      this.metrics.recordResponseTime('getPools', Date.now() - startTime, 'success');
      return responseDto;
    } catch (error) {
      this.logger.error(`Error fetching pools for token pair ${token0}, ${token1}:`, error);
      
      if (error instanceof NotFoundException) {
        this.metrics.recordError('getPools', 'not_found');
        throw error;
      }
      
      if (error.message.includes('Failed to fetch')) {
        this.metrics.recordError('getPools', 'subgraph_error');
        throw new BadGatewayException('Failed to fetch data from subgraph');
      }
      
      this.metrics.recordError('getPools', 'service_error');
      throw new ServiceUnavailableException('Service temporarily unavailable');
    }
  }
}