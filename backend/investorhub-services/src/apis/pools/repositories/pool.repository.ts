import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Pool } from '../../../database/schemas/pool.schemas';
import { BaseRepository } from '../../../database/repositories/base.repository';

@Injectable()
export class PoolRepository extends BaseRepository<Pool> {
  constructor(
    @InjectModel(Pool.name) private readonly poolModel: Model<Pool>,
  ) {
    super(poolModel);
  }

  async findByTokenPair(token0Id: string, token1Id: string): Promise<Pool[]> {
    const token0ObjectId = new Types.ObjectId(token0Id);
    const token1ObjectId = new Types.ObjectId(token1Id);

    return this.poolModel.find({
      $or: [
        { token0: token0ObjectId, token1: token1ObjectId },
        { token0: token1ObjectId, token1: token0ObjectId }
      ]
    }).exec();
  }

  async findByTokenIds(tokenIds: string[]): Promise<Pool[]> {
    const objectIds = tokenIds.map(id => new Types.ObjectId(id));
    
    return this.poolModel.find({
      $or: [
        { token0: { $in: objectIds } },
        { token1: { $in: objectIds } }
      ]
    }).exec();
  }
} 