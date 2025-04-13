import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
  Inject,
  BadGatewayException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';
import { GraphQLClient, gql } from 'graphql-request';
import {
  UniswapPoolResponseDto,
  UniswapPoolsResponseDto,
} from './dtos/list-pools-response.dto';
import { v4 as uuidv4 } from 'uuid';
import { SubgraphMetricsService } from 'src/metrics/subgraph/subgraph-metrics.service';

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
    private readonly subgraphMetricsService: SubgraphMetricsService,
    @Inject('GRAPHQL_CLIENT')
    private readonly graph: GraphQLClient,
  ) {}

  private async fetchWithRetry<T>(query: string, variables?: any, requestId?: string): Promise<T> {
    const queryName = this.extractQueryName(query);
    const startTime = Date.now();
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        this.logger.debug(
          `Attempt ${attempt}/${MAX_RETRIES} for query ${queryName}${requestId ? ` (${requestId})` : ''}`,
        );
        
        const result = await this.graph.request<T>(query, variables);
        const duration = (Date.now() - startTime) / 1000; // Convert to seconds
        
        // Record successful response time
        this.subgraphMetricsService.recordResponseTime(queryName, duration, 'success');
        
        return result;
      } catch (error) {
        this.logger.error(
          `Error in attempt ${attempt}/${MAX_RETRIES} for query ${queryName}${
            requestId ? ` (${requestId})` : ''
          }: ${error.message}`,
        );
        
        if (attempt === MAX_RETRIES) {
          const duration = (Date.now() - startTime) / 1000;
          // Record error response time
          this.subgraphMetricsService.recordResponseTime(queryName, duration, 'error');
          // Record error details
          this.subgraphMetricsService.recordError(queryName, error.name || 'UnknownError');
          
          if (error.response?.errors) {
            throw new BadGatewayException(
              `Subgraph query failed after ${MAX_RETRIES} attempts: ${error.message}`,
            );
          } else if (error.code === 'ECONNREFUSED') {
            throw new ServiceUnavailableException(
              `Subgraph service unavailable after ${MAX_RETRIES} attempts: ${error.message}`,
            );
          } else {
            throw new InternalServerErrorException(
              `Unexpected error after ${MAX_RETRIES} attempts: ${error.message}`,
            );
          }
        }
        
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }
    
    // This should never be reached due to the throw in the loop
    throw new InternalServerErrorException('Unexpected error in fetchWithRetry');
  }
  
  private extractQueryName(query: string): string {
    // Simple extraction of query name from GraphQL query
    const match = query.match(/query\s+(\w+)/);
    return match ? match[1] : 'UnknownQuery';
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
          this.subgraphMetricsService.recordPoolOperation('cache_hit', 'success');
          return JSON.parse(cached);
        }
      } catch (error) {
        this.logger.warn(`[${requestId}] Cache error: ${error.message}`);
        this.subgraphMetricsService.recordPoolOperation('cache_error', 'error');
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
        this.subgraphMetricsService.recordPoolOperation('fetch_pools', 'error');
        throw new NotFoundException(`No pools found for ${tokenA}/${tokenB}`);
      }

      const enrichedPools = pools.map(pool => this.calculatePoolMetrics(pool));
      const response: UniswapPoolsResponseDto = { pools: enrichedPools };

      this.logger.log(`[${requestId}] Fetched ${pools.length} pools for ${tokenA}/${tokenB}`);
      this.logger.debug(`[${requestId}] Response: ${JSON.stringify(response, null, 2)}`);

      try {
        await this.redisService.set(cacheKey, JSON.stringify(response), CACHE_TTL_SECONDS);
        this.logger.log(`[${requestId}] Cached response for ${cacheKey}`);
        this.subgraphMetricsService.recordPoolOperation('cache_set', 'success');
      } catch (error) {
        this.logger.warn(`[${requestId}] Failed to cache response: ${error.message}`);
        this.subgraphMetricsService.recordPoolOperation('cache_set', 'error');
        // Continue even if caching fails
      }

      const duration = Date.now() - startTime;
      this.logger.log(`[${requestId}] Request completed in ${duration}ms`);
      this.subgraphMetricsService.recordPoolOperation('fetch_pools', 'success');
      
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (error instanceof NotFoundException) {
        this.logger.warn(`[${requestId}] Request failed in ${duration}ms: ${error.message}`);
        throw error;
      }
      
      this.logger.error(`[${requestId}] Request failed in ${duration}ms: ${error.message}`);
      this.subgraphMetricsService.recordPoolOperation('fetch_pools', 'error');
      throw new InternalServerErrorException('Failed to fetch pool data');
    }
  }
}