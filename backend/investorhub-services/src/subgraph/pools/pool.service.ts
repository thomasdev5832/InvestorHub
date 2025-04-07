import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from 'src/redis/redis.service';
import { ListPoolsResponseDto } from './dtos/list-pools-response.dto';

@Injectable()
export class PoolService {
  private readonly logger = new Logger(PoolService.name);
  private readonly authToken: string;

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {
    this.authToken = this.configService.get<string>('SUBGRAPH_AUTH_TOKEN') || '';
  }

  async fetchPoolsForTokenPair(
    tokenA: string,
    tokenB: string,
    network: string,
    endpoint: string,
  ): Promise<ListPoolsResponseDto> {
    const cacheKey = `pools:${network}:${tokenA.toLowerCase()}:${tokenB.toLowerCase()}`;
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      this.logger.log(`Cache hit for ${cacheKey}`);
      return JSON.parse(cached);
    }

    const query = `
      {
        pools(where: { token0: "${tokenA}", token1: "${tokenB}" }) {
          id
          token0 { symbol }
          token1 { symbol }
          feeTier
          totalValueLockedUSD
        }
      }
    `;

    let result: any;
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.authToken,
        },
        body: JSON.stringify({ query }),
      });

      result = await response.json();
    } catch (error) {
      this.logger.error('Failed to fetch from subgraph', error);
      throw new InternalServerErrorException('Failed to fetch pool data');
    }

    const pools = result?.data?.pools;
    if (!pools || pools.length === 0) {
      this.logger.warn(`No pools found for ${tokenA}/${tokenB} on ${network}`);
      throw new NotFoundException(`No pools found for ${tokenA}/${tokenB}`);
    }

    const data: ListPoolsResponseDto = {
      network,
      pair: `${pools[0].token0.symbol}/${pools[0].token1.symbol}`,
      pools,
    };

    this.logger.log(`Fetched pools for ${data.pair} on ${network}`);
    this.logger.debug(JSON.stringify(data.pools, null, 2));

    // Cache the result for 60 seconds
    await this.redisService.set(cacheKey, JSON.stringify(data), 60);
    return data;
  }
}