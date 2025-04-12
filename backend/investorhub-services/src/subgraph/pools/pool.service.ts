import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
  Inject,
  BadGatewayException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from 'src/redis/redis.service';
import { GraphQLClient, gql } from 'graphql-request';
import {
  UniswapPoolResponseDto,
  UniswapPoolsResponseDto,
} from './dtos/list-pools-response.dto';
import { v4 as uuidv4 } from 'uuid';

const CACHE_TTL_SECONDS = 60;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// GraphQL query as a constant to avoid string interpolation in the query
const POOLS_QUERY = gql`
  query GetPools($token0: [String!], $token1: [String!]) {
    pools(
      where: {
        token0_in: $token0
        token1_in: $token1
      }
    ) {
      id
      feeTier
      volumeUSD
      volumeUSD30d: volumeUSD
      tvlUSD: totalValueLockedUSD
      token0 { id symbol }
      token1 { id symbol }
      feesUSD
      createdAtTimestamp
    }
  }
`;

// Interface for the GraphQL response
interface PoolsQueryResponse {
  pools: Array<{
    id: string;
    feeTier: string;
    volumeUSD: string;
    volumeUSD30d: string;
    tvlUSD: string;
    token0: { id: string; symbol: string };
    token1: { id: string; symbol: string };
    feesUSD: string;
    createdAtTimestamp: string;
  }>;
}

@Injectable()
export class PoolService {
  private readonly logger = new Logger(PoolService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    @Inject('GRAPHQL_CLIENT')
    private readonly graph: GraphQLClient,
  ) {}

  private async fetchWithRetry<T>(query: string, variables?: any, requestId?: string): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        return await this.graph.request<T>(query, variables);
      } catch (error) {
        lastError = error as Error;
        
        // Check if it's a 500 error (server error)
        if (error.response?.status === 500) {
          this.logger.error(`[${requestId}] Server error (500) received: ${error.message}`);
          throw new BadGatewayException('Subgraph server error');
        }
        
        // Check if it's a 503 error (service unavailable)
        if (error.response?.status === 503) {
          this.logger.error(`[${requestId}] Service unavailable (503): ${error.message}`);
          throw new ServiceUnavailableException('Subgraph service unavailable');
        }
        
        this.logger.warn(
          `[${requestId}] Attempt ${attempt}/${MAX_RETRIES} failed: ${error.message}`,
        );
        
        if (attempt < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
        }
      }
    }

    throw new InternalServerErrorException(
      `Failed after ${MAX_RETRIES} attempts: ${lastError?.message}`,
    );
  }

  private calculatePoolMetrics(pool: PoolsQueryResponse['pools'][0]): UniswapPoolResponseDto {
    const tvl = parseFloat(pool.tvlUSD) || 0;
    const volume1d = parseFloat(pool.volumeUSD) || 0;
    const volume30d = parseFloat(pool.volumeUSD30d) || 0;
    const feeTier = parseInt(pool.feeTier) || 0;

    const apr24h = tvl > 0 ? ((volume1d * (feeTier / 10000)) / tvl) * 365 * 100 : 0;
    const volume1dToTVL = tvl > 0 ? volume1d / tvl : 0;

    return {
      ...pool,
      apr24h: apr24h.toFixed(2),
      volume1dToTVL: volume1dToTVL.toFixed(4),
    };
  }

  async fetchPoolsForTokenPair(
    tokenA: string,
    tokenB: string,
  ): Promise<UniswapPoolsResponseDto> {
    const requestId = uuidv4();
    const startTime = Date.now();
    
    try {
      this.logger.log(`[${requestId}] Fetching pools for ${tokenA}/${tokenB}`);
      
      const tokenALc = tokenA.toLowerCase();
      const tokenBLc = tokenB.toLowerCase();
      const cacheKey = `pools:${tokenALc}:${tokenBLc}`;

      try {
        const cached = await this.redisService.get(cacheKey);
        if (cached) {
          this.logger.log(`[${requestId}] Cache hit for ${cacheKey}`);
          return JSON.parse(cached);
        }
      } catch (error) {
        this.logger.warn(`[${requestId}] Cache error: ${error.message}`);
        // Continue without cache if Redis fails
      }

      const variables = {
        token0: [tokenALc, tokenBLc],
        token1: [tokenALc, tokenBLc],
      };

      const rawResponse = await this.fetchWithRetry<PoolsQueryResponse>(
        POOLS_QUERY, 
        variables,
        requestId
      );
      
      const pools = rawResponse?.pools || [];

      if (!pools.length) {
        this.logger.warn(`[${requestId}] No pools found for ${tokenA}/${tokenB}`);
        throw new NotFoundException(`No pools found for ${tokenA}/${tokenB}`);
      }

      const enrichedPools = pools.map(pool => this.calculatePoolMetrics(pool));
      const response: UniswapPoolsResponseDto = { pools: enrichedPools };

      this.logger.log(`[${requestId}] Fetched ${pools.length} pools for ${tokenA}/${tokenB}`);
      this.logger.debug(`[${requestId}] Response: ${JSON.stringify(response, null, 2)}`);

      try {
        await this.redisService.set(cacheKey, JSON.stringify(response), CACHE_TTL_SECONDS);
        this.logger.log(`[${requestId}] Cached response for ${cacheKey}`);
      } catch (error) {
        this.logger.warn(`[${requestId}] Failed to cache response: ${error.message}`);
        // Continue even if caching fails
      }

      const duration = Date.now() - startTime;
      this.logger.log(`[${requestId}] Request completed in ${duration}ms`);
      
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (error instanceof NotFoundException) {
        this.logger.warn(`[${requestId}] Request failed in ${duration}ms: ${error.message}`);
        throw error;
      }
      
      this.logger.error(`[${requestId}] Request failed in ${duration}ms: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch pool data');
    }
  }
}