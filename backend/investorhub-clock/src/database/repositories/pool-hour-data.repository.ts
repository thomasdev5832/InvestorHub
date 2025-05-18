import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PoolHourData } from '../schemas/pool-hour-data.schema';

@Injectable()
export class PoolHourDataRepository {
  constructor(
    @InjectModel(PoolHourData.name)
    private readonly poolHourDataModel: Model<PoolHourData>,
  ) {}

  async findByPoolDayAndPeriod(poolDayId: Types.ObjectId, periodStartUnix: string): Promise<PoolHourData | null> {
    return this.poolHourDataModel.findOne({
      id_pool_day: poolDayId,
      periodStartUnix,
    }).exec();
  }

  async findOneAndUpdate(
    filter: any,
    update: any,
    options: any,
  ): Promise<PoolHourData | null> {
    const result = await this.poolHourDataModel.findOneAndUpdate(filter, update, options).exec();
    return result ? (result as unknown as PoolHourData) : null;
  }
} 