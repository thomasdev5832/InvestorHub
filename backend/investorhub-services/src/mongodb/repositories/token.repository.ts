import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Token } from '../schemas/token.schema';
import { BaseRepository } from './base.repository';

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
} 