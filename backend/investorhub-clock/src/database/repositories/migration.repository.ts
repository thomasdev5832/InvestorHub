import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Migration } from '../schemas/migration.schema';
import { BaseRepository } from './base.repository';

@Injectable()
export class MigrationRepository extends BaseRepository<Migration> {
  constructor(
    @InjectModel(Migration.name)
    private readonly migrationModel: Model<Migration>,
  ) {
    super(migrationModel);
  }

  async findByName(name: string): Promise<Migration | null> {
    return this.migrationModel.findOne({ name }).exec();
  }

  async deleteByName(name: string): Promise<boolean> {
    const result = await this.migrationModel.deleteOne({ name }).exec();
    return result.deletedCount > 0;
  }
} 