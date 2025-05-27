import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'pool_day_datas', timestamps: true })
export class PoolDayData extends Document {

  @Prop({ type: Types.ObjectId, ref: 'Pool', required: true })
  id_pool: Types.ObjectId;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  feesUSD: string;

  @Prop({ required: true })
  volumeUSD: string;

  @Prop({ required: true })
  tvlUSD: string;

  // Denormalized fields for easier querying
  @Prop({ type: Types.ObjectId, ref: 'Token' })
  token0: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Token' })
  token1: Types.ObjectId;

  @Prop()
  feeTier: string;
}

export const PoolDayDataSchema = SchemaFactory.createForClass(PoolDayData);

// Add indexes
PoolDayDataSchema.index({ id: 1 });
PoolDayDataSchema.index({ id_pool: 1 });
PoolDayDataSchema.index({ date: 1 });
PoolDayDataSchema.index({ id_pool: 1, date: 1 }, { unique: true });
PoolDayDataSchema.index({ token0: 1, token1: 1, feeTier: 1 });
PoolDayDataSchema.index({ token0: 1 });
PoolDayDataSchema.index({ token1: 1 });
PoolDayDataSchema.index({ feeTier: 1 });
