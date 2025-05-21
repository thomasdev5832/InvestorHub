import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseRepository } from './base.repository';
import { ProtocolConfig } from '../schemas/protocol-config.schema';

@Injectable()
export class ProtocolConfigRepository extends BaseRepository<ProtocolConfig> {
  constructor(
    @InjectModel(ProtocolConfig.name)
    private readonly protocolConfigModel: Model<ProtocolConfig>,
  ) {
    super(protocolConfigModel);
  }

  async findByNetwork(networkId: string): Promise<ProtocolConfig | null> {
    return this.protocolConfigModel.findOne({ networks: networkId }).exec();
  }

  async findByUniswapV3Url(url: string): Promise<ProtocolConfig | null> {
    return this.protocolConfigModel.findOne({ uniswapV3Url: url }).exec();
  }

  async findByUniswapV4Url(url: string): Promise<ProtocolConfig | null> {
    return this.protocolConfigModel.findOne({ uniswapV4Url: url }).exec();
  }

  async addNetwork(protocolId: Types.ObjectId, networkId: Types.ObjectId): Promise<ProtocolConfig | null> {
    return this.protocolConfigModel.findByIdAndUpdate(
      protocolId,
      { $push: { networks: networkId } },
      { new: true }
    ).exec();
  }
} 