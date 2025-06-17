import {
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { PoolRepository } from './repositories/pool.repository';
import { PoolDayDataRepository } from './repositories/pool-day-data.repository';
import { UniswapPoolResponseDto, UniswapPoolsResponseDto } from '../shared/dtos/list-pools-response.dto';
import { Pool } from '../../database/schemas/pool.schemas';
import { PoolDayData } from '../../database/schemas/pool-day-data.schema';
import { Token } from '../../database/schemas/token.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

type TokenDocument = Token & { _id: Types.ObjectId };

@Injectable()
export class PoolService {
  private readonly logger = new Logger(PoolService.name);

  constructor(
    private readonly poolRepository: PoolRepository,
    private readonly poolDayDataRepository: PoolDayDataRepository,
    @InjectModel(Token.name) private readonly tokenModel: Model<TokenDocument>,
  ) { }

  private calculatePoolMetrics(pool: Pool, poolDayData: PoolDayData[]): UniswapPoolResponseDto {
    // Calculate APR24h for each day's data
    const poolDayDataWithApr = poolDayData.map(dayData => {
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
      token0: {
        id: pool.token0.toString(),
        symbol: '', // Will be populated later
      },
      token1: {
        id: pool.token1.toString(),
        symbol: '', // Will be populated later 
      },
      createdAtTimestamp: pool.block || '0',
      poolDayData: poolDayDataWithApr,
    };
  }

  async fetchPoolsForTokenPair(token0Address: string, token1Address: string): Promise<UniswapPoolsResponseDto> {
    try {
      // Find tokens by their Ethereum addresses
      const [token0, token1] = await Promise.all([
        this.tokenModel.findOne({ address: token0Address.toLowerCase() }),
        this.tokenModel.findOne({ address: token1Address.toLowerCase() })
      ]);

      if (!token0 || !token1) {
        throw new NotFoundException(
          `Token(s) not found: ${!token0 ? token0Address : ''} ${!token1 ? token1Address : ''}`
        );
      }

      // Find pools for this token pair using the token ObjectIds
      const pools = await this.poolRepository.findByTokenPair(
        token0._id.toString(),
        token1._id.toString()
      );

      if (!pools || pools.length === 0) {
        throw new NotFoundException(`No pools found for token pair: ${token0Address}, ${token1Address}`);
      }

      const poolIds = pools.map(pool => pool.id.toString());

      // Get pool day data for all pools
      const allPoolDayData = await this.poolDayDataRepository.findByPoolIds(poolIds);

      // Group pool day data by pool ID
      const poolDayDataByPoolId = allPoolDayData.reduce((acc, data) => {
        const poolId = data.id_pool.toString();
        if (!acc[poolId]) {
          acc[poolId] = [];
        }
        acc[poolId].push(data);
        return acc;
      }, {});

      // Transform pools with day data
      const transformedPools = pools.map(pool => {
        const poolId = pool.id.toString();
        const dayData = poolDayDataByPoolId[poolId] || [];
        return this.calculatePoolMetrics(pool, dayData);
      });

      const responseDto: UniswapPoolsResponseDto = {
        pools: transformedPools,
        blockNumber: '0', // MongoDB doesn't have block numbers, so we set to 0
      };

      return responseDto;
    } catch (error) {
      this.logger.error(`Error fetching pools for token pair ${token0Address}, ${token1Address}:`, error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new ServiceUnavailableException('Service temporarily unavailable');
    }
  }
} 