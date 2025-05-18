import { Injectable, Logger } from '@nestjs/common';
import { UniswapPoolsResponseDto } from '../shared/dtos/list-pools-response.dto';
import { PoolRepository } from '../database/repositories/pool.repository';
import { PoolDayDataRepository } from '../database/repositories/pool-day-data.repository';
import { PoolHourDataRepository } from '../database/repositories/pool-hour-data.repository';
import { Pool } from '../database/schemas/pool.schemas';

@Injectable()
export class PoolStorageService {
  private readonly logger = new Logger(PoolStorageService.name);

  constructor(
    private readonly poolRepository: PoolRepository,
    private readonly poolDayDataRepository: PoolDayDataRepository,
    private readonly poolHourDataRepository: PoolHourDataRepository,
  ) {}

  private async savePoolHourData(
    poolDayData: UniswapPoolsResponseDto['pools'][0]['poolDayData'][0],
    savedPoolDayData: any,
    savedPool: Pool,
    token0Id: string,
    token1Id: string,
  ): Promise<void> {
    if (!poolDayData.poolHourData || poolDayData.poolHourData.length === 0) {
      return;
    }

    const hourDataPromises = poolDayData.poolHourData.map(async (hourData) => {
      // Check if pool hour data already exists
      const existingHourData = await this.poolHourDataRepository.findByPoolDayAndPeriod(
        savedPoolDayData._id,
        hourData.periodStartUnix,
      );

      if (existingHourData) {
        this.logger.debug(
          `Pool hour data for period ${hourData.periodStartUnix} already exists, skipping...`,
        );
        return;
      }

      const poolHourData = {
        id_pool_day: savedPoolDayData._id,
        feesUSD: hourData.feesUSD,
        volumeUSD: hourData.volumeUSD,
        tvlUSD: hourData.tvlUSD,
        periodStartUnix: hourData.periodStartUnix,
        // Denormalized fields
        id_pool: savedPool._id,
        token0: token0Id,
        token1: token1Id,
        feeTier: savedPool.feeTier,
      };

      await this.poolHourDataRepository.findOneAndUpdate(
        {
          id_pool_day: savedPoolDayData._id,
          periodStartUnix: hourData.periodStartUnix,
        },
        poolHourData,
        { upsert: true, new: true },
      );

      this.logger.debug(
        `Saved pool hour data for period ${hourData.periodStartUnix}`,
      );
    });

    await Promise.all(hourDataPromises);
  }

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
          `Pool day data for ${pool.token0.symbol}-${pool.token1.symbol} (${pool.feeTier}) on date ${dayData.date} already exists, checking hour data...`,
        );
        await this.savePoolHourData(dayData, existingDayData, savedPool, token0Id, token1Id);
        return;
      }

      const poolDayData = {
        id_pool: savedPool._id,
        date: dayData.date,
        feesUSD: dayData.feesUSD,
        volumeUSD: dayData.volumeUSD,
        tvlUSD: dayData.tvlUSD,
        apr24h: dayData.apr24h,
        // Denormalized fields
        token0: token0Id,
        token1: token1Id,
        feeTier: pool.feeTier,
      };

      const savedDayData = await this.poolDayDataRepository.findOneAndUpdate(
        {
          id_pool: savedPool._id,
          date: dayData.date,
        },
        poolDayData,
        { upsert: true, new: true },
      );

      if (!savedDayData) {
        this.logger.error(
          `Failed to save pool day data for ${pool.token0.symbol}-${pool.token1.symbol} (${pool.feeTier}) on date ${dayData.date}`,
        );
        return;
      }

      await this.savePoolHourData(dayData, savedDayData, savedPool, token0Id, token1Id);

      this.logger.debug(
        `Saved pool day data for ${pool.token0.symbol}-${pool.token1.symbol} (${pool.feeTier}) on date ${dayData.date} with ${dayData.poolHourData?.length || 0} hour data entries`,
      );
    });

    await Promise.all(dayDataPromises);
  }

  async savePools(pools: UniswapPoolsResponseDto, token0Id: string, token1Id: string): Promise<void> {
    try {
      for (const pool of pools.pools) {
        // Check if pool already exists with the same token0, token1, and feeTier
        console.log(`Checking if pool ${token0Id}-${token1Id} (${pool.feeTier}) already exists...`);
        const existingPool = await this.poolRepository.findByTokensAndBlock(
          token0Id,
          token1Id,
          pool.feeTier,
        );
        console.log(`Existing pool: ${existingPool}`);
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
          address: pool.id,
        };

        const savedPool = await this.poolRepository.findOneAndUpdate(
          {
            address: pool.id,
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