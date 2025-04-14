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

  async fetchPoolsForTokenPair(tokenA: string, tokenB: string): Promise<UniswapPoolsResponseDto> {
    const tokenALc = tokenA.toLowerCase();
    const tokenBLc = tokenB.toLowerCase();
    const cacheKey = `pools:${[tokenALc, tokenBLc].sort().join('|')}`;
    
    try {
      // Try to get from cache first
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        this.logger.debug(`Cache hit for token pair: ${tokenA}, ${tokenB}`);
        return JSON.parse(cached);
      }

      // Fetch from subgraph if not in cache
      const response = await this.fetchWithRetry<RawPoolsResponse>(async () => {
        const result = await this.graph.request<RawPoolsResponse>(POOLS_QUERY, {
          token0: [tokenALc, tokenBLc],
          token1: [tokenALc, tokenBLc],
        });
        
        if (!result || !result.pools) {
          throw new NotFoundException(`No pools found for token pair: ${tokenA}, ${tokenB}`);
        }
        
        return result;
      });

      // Transform and cache the response
      const transformedPools = response.pools.map(this.calculatePoolMetrics);
      const responseDto: UniswapPoolsResponseDto = { 
        pools: transformedPools,
      };
      await this.redis.set(cacheKey, JSON.stringify(responseDto), this.CACHE_TTL);
      
      return responseDto;
    } catch (error) {
      this.logger.error(`Error fetching pools for token pair ${tokenA}, ${tokenB}:`, error);
      
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      if (error.message.includes('Failed to fetch')) {
        throw new BadGatewayException('Failed to fetch data from subgraph');
      }
      
      throw new ServiceUnavailableException('Service temporarily unavailable');
    }
  }
}