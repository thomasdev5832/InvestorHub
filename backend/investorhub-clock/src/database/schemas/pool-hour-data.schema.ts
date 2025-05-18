import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'pool_hour_datas', timestamps: true })
export class PoolHourData extends Document {

  @Prop({ type: Types.ObjectId, ref: 'PoolDayData', required: true })
  id_pool_day: Types.ObjectId;

  @Prop({ required: true })
  feesUSD: string;

  @Prop({ required: true })
  tvlUSD: string;

  @Prop({ required: true })
  volumeUSD: string;

  @Prop({ required: true })
  periodStartUnix: string;

  // Denormalized fields for easier querying
  @Prop({ type: Types.ObjectId, ref: 'Pool' })
  id_pool: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Token' })
  token0: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Token' })
  token1: Types.ObjectId;

  @Prop()
  feeTier: string;
}

export const PoolHourDataSchema = SchemaFactory.createForClass(PoolHourData);

// Add indexes
PoolHourDataSchema.index({ id: 1 });
PoolHourDataSchema.index({ id_pool_day: 1 });
PoolHourDataSchema.index({ id_pool: 1 });
PoolHourDataSchema.index({ token0: 1, token1: 1, feeTier: 1 });
PoolHourDataSchema.index({ token0: 1 });
PoolHourDataSchema.index({ token1: 1 });
PoolHourDataSchema.index({ feeTier: 1 });
PoolHourDataSchema.index({ id_pool_day: 1, periodStartUnix: 1 }, { unique: true });
