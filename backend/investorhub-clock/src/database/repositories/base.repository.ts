import { Model, Document } from 'mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class BaseRepository<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async create(data: Partial<T>): Promise<T> {
    const entity = new this.model(data);
    return entity.save();
  }

  async findAll(): Promise<T[]> {
    return this.model.find().exec();
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec();
  }

  async findOne(filter: any): Promise<T | null> {
    return this.model.findOne(filter).exec();
  }

  async createMany(data: Partial<T>[]): Promise<T[]> {
    const result = await this.model.insertMany(data);
    return result as unknown as T[];
  }

  async deleteOne(filter: any): Promise<boolean> {
    const result = await this.model.deleteOne(filter).exec();
    return result.deletedCount > 0;
  }

  async deleteMany(filter: any): Promise<boolean> {
    const result = await this.model.deleteMany(filter).exec();
    return result.deletedCount > 0;
  }
} 