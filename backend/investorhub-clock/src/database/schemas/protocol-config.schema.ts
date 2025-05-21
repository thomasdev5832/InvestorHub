import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'protocol_configs', timestamps: true })
export class ProtocolConfig extends Document {
  @Prop({ required: true })
  uniswapV3Url: string;

  @Prop({ required: true })
  uniswapV4Url: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'NetworkConfig' }] })
  networks: Types.ObjectId[];

  @Prop({ default: true })
  isActive: boolean;
}

export const ProtocolConfigSchema = SchemaFactory.createForClass(ProtocolConfig);

// Add indexes
ProtocolConfigSchema.index({ id: 1 }, { unique: true });
ProtocolConfigSchema.index({ uniswapV3Url: 1 });
ProtocolConfigSchema.index({ uniswapV4Url: 1 });
ProtocolConfigSchema.index({ networks: 1 });
ProtocolConfigSchema.index({ isActive: 1 });