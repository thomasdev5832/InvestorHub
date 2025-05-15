import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Token } from '../../database/schemas/token.schema';
import { BaseRepository } from '../../database/repositories/base.repository';

@Injectable()
export class TokenRepository extends BaseRepository<Token> {
  constructor(
    @InjectModel(Token.name) private readonly tokenModel: Model<Token>,
  ) {
    super(tokenModel);
  }

  async findByAddress(address: string): Promise<Token | null> {
    return this.tokenModel.findOne({ address }).exec();
  }

  async findBySymbol(symbol: string): Promise<Token | null> {
    return this.tokenModel.findOne({ symbol }).exec();
  }

  async findByName(name: string): Promise<Token | null> {
    return this.tokenModel.findOne({ name }).exec();
  }
} 