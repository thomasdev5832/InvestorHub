import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, UpdateQuery } from 'mongoose';
import { Pool } from '../schemas/pool.schemas';

@Injectable()
export class PoolRepository {
  constructor(
    @InjectModel(Pool.name) private readonly poolModel: Model<Pool>,
  ) {}

  async findOneAndUpdate(
    filter: FilterQuery<Pool>,
    update: UpdateQuery<Pool>,
    options: { upsert: boolean; new: boolean },
  ): Promise<Pool | null> {
    return this.poolModel.findOneAndUpdate(filter, update, options);
  }

  async findById(id: string): Promise<Pool | null> {
    return this.poolModel.findById(id);
  }

  async findByTokensAndBlock(token0: string, token1: string, block: string): Promise<Pool | null> {
    return this.poolModel.findOne({ token0, token1, block });
  }
} 