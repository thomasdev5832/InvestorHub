import { Injectable, Logger } from '@nestjs/common';
import { UniswapPoolsResponseDto } from '../shared/dtos/list-pools-response.dto';
import { PoolRepository } from '../database/repositories/pool.repository';
import { PoolDayDataRepository } from '../database/repositories/pool-day-data.repository';
import { Pool } from '../database/schemas/pool.schemas';

@Injectable()
export class PoolStorageService {
  private readonly logger = new Logger(PoolStorageService.name);

  constructor(
    private readonly poolRepository: PoolRepository,
    private readonly poolDayDataRepository: PoolDayDataRepository,
  ) {}

  private async savePoolDayData(
    pool: UniswapPoolsResponseDto['pools'][0],
    savedPool: Pool,
    token0Id: string,
    token1Id: string,
  ): Promise<void> {
    if (!pool.poolDayData || pool.poolDayData.length === 0) {
      return;
    }

    const dayDataPromises = pool.poolDayData.map(async (dayData) => {
      // Check if pool day data already exists
      const existingDayData = await this.poolDayDataRepository.findByPoolAndDate(
        savedPool.id,
        dayData.date,
      );

      if (existingDayData) {
        this.logger.debug(
          `Pool day data for ${pool.token0.symbol}-${pool.token1.symbol} (${pool.feeTier}) on date ${dayData.date} already exists, skipping...`,
        );
        return;
      }

      const poolDayData = {
        id_pool: savedPool._id,
        date: dayData.date,
        feesUSD: dayData.feesUSD,
        volumeUSD: dayData.volumeUSD,
        tvlUSD: dayData.tvlUSD,
        // Denormalized fields
        token0: token0Id,
        token1: token1Id,
        feeTier: pool.feeTier,
      };

      await this.poolDayDataRepository.findOneAndUpdate(
        {
          id_pool: savedPool._id,
          date: dayData.date,
        },
        poolDayData,
        { upsert: true, new: true },
      );

      this.logger.debug(
        `Saved pool day data for ${pool.token0.symbol}-${pool.token1.symbol} (${pool.feeTier}) on date ${dayData.date}`,
      );
    });

    await Promise.all(dayDataPromises);
  }

  async savePools(pools: UniswapPoolsResponseDto, token0Id: string, token1Id: string): Promise<void> {
    try {
      for (const pool of pools.pools) {
        // Check if pool already exists with the same token0, token1, and feeTier
        const existingPool = await this.poolRepository.findByTokensAndBlock(
          token0Id,
          token1Id,
          pool.feeTier,
        );

        if (existingPool) {
          this.logger.debug(
            `Pool ${pool.token0.symbol}-${pool.token1.symbol} (${pool.feeTier}) already exists, checking pool day data...`,
          );
          await this.savePoolDayData(pool, existingPool, token0Id, token1Id);
          continue;
        }

        // Create new pool
        const poolData = {
          name: `${pool.token0.symbol}-${pool.token1.symbol}`,
          feeTier: pool.feeTier,
          token0: token0Id,
          token1: token1Id,
          block: pools.blockNumber,
        };

        const savedPool = await this.poolRepository.findOneAndUpdate(
          {
            token0: token0Id,
            token1: token1Id,
            feeTier: pool.feeTier,
          },
          poolData,
          { upsert: true, new: true },
        );

        if (!savedPool) {
          this.logger.error(
            `Failed to save pool ${pool.token0.symbol}-${pool.token1.symbol} (${pool.feeTier})`,
          );
          continue;
        }

        await this.savePoolDayData(pool, savedPool, token0Id, token1Id);

        this.logger.debug(
          `Saved pool ${pool.token0.symbol}-${pool.token1.symbol} (${pool.feeTier}) with ${pool.poolDayData?.length || 0} day data entries`,
        );
      }
    } catch (error) {
      this.logger.error(`Error saving pools: ${error.message}`, error.stack);
      throw error;
    }
  }
} 