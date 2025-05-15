import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PoolDayData } from '../../../database/schemas/pool-day-data.schema';
import { BaseRepository } from '../../../database/repositories/base.repository';

@Injectable()
export class PoolDayDataRepository extends BaseRepository<PoolDayData> {
  constructor(
    @InjectModel(PoolDayData.name) private readonly poolDayDataModel: Model<PoolDayData>,
  ) {
    super(poolDayDataModel);
  }

  async findByPoolIds(poolIds: string[], limit = 7): Promise<PoolDayData[]> {
    const objectIds = poolIds.map(id => new Types.ObjectId(id));
    
    return this.poolDayDataModel.find({
      id_pool: { $in: objectIds }
    })
    .sort({ date: -1 })
    .limit(limit)
    .exec();
  }

  async findByPoolId(poolId: string, limit = 7): Promise<PoolDayData[]> {
    const objectId = new Types.ObjectId(poolId);
    
    return this.poolDayDataModel.find({
      id_pool: objectId
    })
    .sort({ date: -1 })
    .limit(limit)
    .exec();
  }
} 