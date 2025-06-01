import {
  Injectable,
  Logger,
  NotFoundException,
  BadGatewayException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
import { GraphQLClient } from 'graphql-request';
import { UniswapPoolResponseDto, UniswapPoolsResponseDto } from '../../shared/dtos/list-pools-response.dto';
import { SubgraphMetricsService } from '../../metrics/subgraph/subgraph-metrics.service';
import { ConfigService } from '@nestjs/config';
import { NetworkConfig } from '../../database/schemas/network-config.schema';

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
      id
      poolDayData(orderDirection: desc, orderBy: date, first: 7) {
        date
        feesUSD
        volumeUSD
        tvlUSD
        pool {
          poolHourData(first: 24, orderBy: periodStartUnix, orderDirection: desc) {
            volumeUSD
            tvlUSD
            feesUSD
            periodStartUnix
          }
        }
      }
    }
  }
`;

const POOLS_DAILY_QUERY = `
  query GetPoolsDaily($token0: [String!], $token1: [String!], $block: Int!) {
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
      poolDayData(orderDirection: desc, orderBy: date, first: 1) {
        date
        feesUSD
        volumeUSD
        tvlUSD
      }
    }
  }
`;

const POOLS_HOURLY_QUERY = `
  query GetPoolsHourly($token0: [String!], $token1: [String!], $block: Int!) {
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
      poolDayData(orderDirection: desc, orderBy: date, first: 1) {
        date
        pool {
          poolHourData(first: 1, orderBy: periodStartUnix, orderDirection: desc) {
            volumeUSD
            tvlUSD
            feesUSD
            periodStartUnix
          }
        }
      }
    }
  }
`;

interface RawToken {
  id: string;
  symbol: string;
}

interface RawPoolHourData {
  volumeUSD: string;
  tvlUSD: string;
  feesUSD: string;
  periodStartUnix: string;
}

interface RawPoolDayData {
  date: string;
  feesUSD: string;
  volumeUSD: string;
  tvlUSD: string;
  pool: {
    poolHourData: RawPoolHourData[];
  };
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
  private readonly CACHE_TTL = 10; // 10 seconds

  constructor(
    private readonly redis: RedisService,
    private readonly metrics: SubgraphMetricsService,
    private readonly configService: ConfigService,
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
        poolHourData: dayData.pool.poolHourData,
      };
    });
    
    return {
      id: pool.id,
      feeTier: pool.feeTier,
      token0: pool.token0,
      token1: pool.token1,
      createdAtTimestamp: pool.createdAtTimestamp,
      poolDayData: poolDayDataWithApr,
    };
  }

  private createGraphQLClient(network: NetworkConfig): GraphQLClient {
    const authToken = this.configService.get<string>('SUBGRAPH_AUTH_TOKEN');
    return new GraphQLClient(network.graphqlUrl, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
  }

  async fetchPoolsForTokenPair(
    token0: string, 
    token1: string, 
    network: NetworkConfig,
    blockNumber: number,
  ): Promise<UniswapPoolsResponseDto> {
    const cacheKey = `pools:${network.chainId}:${[token0, token1].sort().join('|')}:${blockNumber}`;
    const startTime = Date.now();
    
    try {
      // Try to get from cache first
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        this.logger.debug(`Cache hit for token pair: ${token0}, ${token1} on network ${network.name}`);
        this.metrics.recordResponseTime('getPools', Date.now() - startTime, 'cache_hit');
        return JSON.parse(cached);
      }

      const graph = this.createGraphQLClient(network);
      
      // Fetch from subgraph if not in cache
      const response = await this.fetchWithRetry<RawPoolsResponse>(async () => {
        const result = await graph.request<RawPoolsResponse>(POOLS_QUERY, {
          token0: [token0, token1],
          token1: [token0, token1],
          block: blockNumber,
        });

        if (!result || !result.pools) {
          throw new NotFoundException(`No pools found for token pair: ${token0}, ${token1} on network ${network.name}`);
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
      
      this.metrics.recordResponseTime('getPools', Date.now() - startTime, 'success');
      return responseDto;
    } catch (error) {
      this.logger.error(`Error fetching pools for token pair ${token0}, ${token1} on network ${network.name}:`, error);
      
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

  async fetchPoolsDailyUpdate(
    token0: string,
    token1: string,
    network: NetworkConfig,
    blockNumber: number,
  ): Promise<UniswapPoolsResponseDto> {
    const cacheKey = `pools:daily:${network.chainId}:${[token0, token1].sort().join('|')}:${blockNumber}`;
    const startTime = Date.now();
    
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        this.logger.debug(`Cache hit for daily update: ${token0}, ${token1} on network ${network.name}`);
        this.metrics.recordResponseTime('getPoolsDaily', Date.now() - startTime, 'cache_hit');
        return JSON.parse(cached);
      }

      const graph = this.createGraphQLClient(network);
      
      const response = await this.fetchWithRetry<RawPoolsResponse>(async () => {
        const result = await graph.request<RawPoolsResponse>(POOLS_DAILY_QUERY, {
          token0: [token0, token1],
          token1: [token0, token1],
          block: blockNumber,
        });

        if (!result || !result.pools) {
          throw new NotFoundException(`No pools found for daily update: ${token0}, ${token1} on network ${network.name}`);
        }
        
        return result;
      });

      const transformedPools = response.pools.map(this.calculatePoolMetrics);
      const responseDto: UniswapPoolsResponseDto = {
        pools: transformedPools,
        blockNumber: blockNumber.toString(),
      };
      await this.redis.set(cacheKey, JSON.stringify(responseDto), this.CACHE_TTL);
      
      this.metrics.recordResponseTime('getPoolsDaily', Date.now() - startTime, 'success');
      return responseDto;
    } catch (error) {
      this.logger.error(`Error fetching daily update for token pair ${token0}, ${token1} on network ${network.name}:`, error);
      throw this.handleError(error);
    }
  }

  async fetchPoolsHourlyUpdate(
    token0: string,
    token1: string,
    network: NetworkConfig,
    blockNumber: number,
  ): Promise<UniswapPoolsResponseDto> {
    const cacheKey = `pools:hourly:${network.chainId}:${[token0, token1].sort().join('|')}:${blockNumber}`;
    const startTime = Date.now();
    
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        this.logger.debug(`Cache hit for hourly update: ${token0}, ${token1} on network ${network.name}`);
        this.metrics.recordResponseTime('getPoolsHourly', Date.now() - startTime, 'cache_hit');
        return JSON.parse(cached);
      }

      const graph = this.createGraphQLClient(network);
      
      const response = await this.fetchWithRetry<RawPoolsResponse>(async () => {
        const result = await graph.request<RawPoolsResponse>(POOLS_HOURLY_QUERY, {
          token0: [token0, token1],
          token1: [token0, token1],
          block: blockNumber,
        });

        if (!result || !result.pools) {
          throw new NotFoundException(`No pools found for hourly update: ${token0}, ${token1} on network ${network.name}`);
        }
        
        return result;
      });

      const transformedPools = response.pools.map(this.calculatePoolMetrics);
      const responseDto: UniswapPoolsResponseDto = {
        pools: transformedPools,
        blockNumber: blockNumber.toString(),
      };
      await this.redis.set(cacheKey, JSON.stringify(responseDto), this.CACHE_TTL);
      
      this.metrics.recordResponseTime('getPoolsHourly', Date.now() - startTime, 'success');
      return responseDto;
    } catch (error) {
      this.logger.error(`Error fetching hourly update for token pair ${token0}, ${token1} on network ${network.name}:`, error);
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error instanceof NotFoundException) {
      this.metrics.recordError('getPools', 'not_found');
      return error;
    }
    
    if (error.message.includes('Failed to fetch')) {
      this.metrics.recordError('getPools', 'subgraph_error');
      return new BadGatewayException('Failed to fetch data from subgraph');
    }
    
    this.metrics.recordError('getPools', 'service_error');
    return new ServiceUnavailableException('Service temporarily unavailable');
  }
} 