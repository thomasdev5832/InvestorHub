import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { NetworkConfig } from './network-config.schema';

@Schema({ collection: 'tokens', timestamps: true })
export class Token extends Document {

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  symbol: string;

  @Prop()
  imageUrl?: string;

  @Prop({ required: true, unique: true })
  address: string;

  @Prop({ required: true, default: 18 })
  decimals: number;

  @Prop({ type: Types.ObjectId, ref: 'NetworkConfig', required: true })
  network: NetworkConfig;
}

export const TokenSchema = SchemaFactory.createForClass(Token);

// Add indexes
TokenSchema.index({ id: 1 });
TokenSchema.index({ symbol: 1 });
TokenSchema.index({ network: 1 });
TokenSchema.index({ address: 1 }, { unique: true });
