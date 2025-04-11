import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from 'src/redis/redis.service';
import { GraphQLClient, gql } from 'graphql-request';
import {
  UniswapPoolResponseDto,
  UniswapPoolsResponseDto,
} from './dtos/list-pools-response.dto';

@Injectable()
export class PoolService {
  private readonly logger = new Logger(PoolService.name);
  private readonly authToken: string;

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    @Inject('GRAPHQL_CLIENT')
    private readonly graph: GraphQLClient,
  ) {
    this.authToken = this.configService.get<string>('SUBGRAPH_AUTH_TOKEN') || '';
  }

  async fetchPoolsForTokenPair(
    tokenA: string,
    tokenB: string,
  ): Promise<UniswapPoolsResponseDto> {
    const tokenALc = tokenA.toLowerCase();
    const tokenBLc = tokenB.toLowerCase();
    const cacheKey = `pools:${tokenALc}:${tokenBLc}`;

    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      this.logger.log(`Cache hit for ${cacheKey}`);
      return JSON.parse(cached);
    }

    const query = gql`
      {
        pools(
          where: {
            token0_in: ["${tokenALc}", "${tokenBLc}"]
            token1_in: ["${tokenALc}", "${tokenBLc}"]
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

    let rawResponse: { pools: any[] };

    try {
      rawResponse = await this.graph.request(query);
    } catch (error) {
      this.logger.error('Failed to fetch from subgraph', error);
      throw new InternalServerErrorException('Failed to fetch pool data');
    }

    const pools = rawResponse?.pools || [];

    if (!pools.length) {
      this.logger.warn(`No pools found for ${tokenA}/${tokenB}`);
      throw new NotFoundException(`No pools found for ${tokenA}/${tokenB}`);
    }

    const enrichedPools: UniswapPoolResponseDto[] = pools.map(pool => {
      const tvl = parseFloat(pool.tvlUSD);
      const volume1d = parseFloat(pool.volumeUSD);
      const volume30d = parseFloat(pool.volumeUSD30d);
      const feeTier = parseInt(pool.feeTier);

      const apr24h = tvl > 0 ? ((volume1d * (feeTier / 10000)) / tvl) * 365 * 100 : 0;
      const volume1dToTVL = tvl > 0 ? volume1d / tvl : 0;

      return {
        ...pool,
        apr24h: apr24h.toFixed(2),
        volume1dToTVL: volume1dToTVL.toFixed(4),
      };
    });

    const response: UniswapPoolsResponseDto = {
      pools: enrichedPools,
    };

    this.logger.log(`Fetched pools for ${tokenA}/${tokenB}`);
    this.logger.debug(JSON.stringify(response, null, 2));

    await this.redisService.set(cacheKey, JSON.stringify(response), 60);
    return response;
  }
}