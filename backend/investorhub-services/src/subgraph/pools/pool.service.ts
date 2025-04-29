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
import { BlockHelper } from '../helpers/block.helper';

const POOLS_QUERY = `
  query GetPools($token0: [String!], $token1: [String!], $block: Int!) {
    pools(where: { token0_in: $token0, token1_in: $token1 }, block: { number: $block }) {
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
      createdAtTimestamp
      poolDayData(orderDirection: desc, orderBy: date, first: 7) {
        date
        feesUSD
        volumeUSD
        tvlUSD
      }
    }
  }
`;

interface RawToken {
  id: string;
  symbol: string;
}

interface RawPoolDayData {
  date: string;
  feesUSD: string;
  volumeUSD: string;
  tvlUSD: string;
}

interface RawPool {
  id: string;
  token0: RawToken;
  token1: RawToken;
  feeTier: string;
  createdAtTimestamp: string;
  poolDayData: RawPoolDayData[];
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
    private readonly blockHelper: BlockHelper,
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
    // Calculate APR24h for each day's data
    const poolDayDataWithApr = pool.poolDayData.map(dayData => {
      const dayFees = parseFloat(dayData.feesUSD) || 0;
      const dayTVL = parseFloat(dayData.tvlUSD) || 0;
      
      let apr24h = 0;
      if (dayTVL > 0) {
        apr24h = (dayFees / dayTVL) * 365 * 100;
      }
      
      return {
        date: dayData.date,
        feesUSD: dayData.feesUSD,
        volumeUSD: dayData.volumeUSD,
        tvlUSD: dayData.tvlUSD,
        apr24h: apr24h.toFixed(2),
      };
    });
    
    return {
      feeTier: pool.feeTier,
      token0: pool.token0,
      token1: pool.token1,
      createdAtTimestamp: pool.createdAtTimestamp,
      poolDayData: poolDayDataWithApr,
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

      // Get current block number
      const blockNumber = await this.blockHelper.getCurrentBlockNumber();
      
      // Fetch from subgraph if not in cache
      const response = await this.fetchWithRetry<RawPoolsResponse>(async () => {
        const result = await this.graph.request<RawPoolsResponse>(POOLS_QUERY, {
          token0: [tokenALc, tokenBLc],
          token1: [tokenALc, tokenBLc],
          block: blockNumber,
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
        blockNumber: blockNumber.toString(),
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