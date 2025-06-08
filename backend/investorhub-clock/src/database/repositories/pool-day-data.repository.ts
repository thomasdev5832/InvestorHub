import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, UpdateQuery } from 'mongoose';
import { PoolDayData } from '../schemas/pool-day-data.schema';

@Injectable()
export class PoolDayDataRepository {
  constructor(
    @InjectModel(PoolDayData.name) private readonly poolDayDataModel: Model<PoolDayData>,
  ) {}

  async findOneAndUpdate(
    filter: FilterQuery<PoolDayData>,
    update: UpdateQuery<PoolDayData>,
    options: { upsert: boolean; new: boolean },
  ): Promise<PoolDayData | null> {
    return this.poolDayDataModel.findOneAndUpdate(filter, update, options);
  }

  async findByPoolAndDate(poolId: string, date: string): Promise<PoolDayData | null> {
    return this.poolDayDataModel.findOne({ id_pool: poolId, date });
  }

  async findByPoolId(poolId: string): Promise<PoolDayData[]> {
    return this.poolDayDataModel.find({ id_pool: poolId });
  }
} 