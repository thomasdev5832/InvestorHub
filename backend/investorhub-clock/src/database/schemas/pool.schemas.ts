import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'pools', timestamps: true })
export class Pool extends Document {

  @Prop()
  name?: string;

  @Prop({ required: true })
  feeTier: string;

  @Prop({ type: Types.ObjectId, ref: 'Token', required: true })
  token0: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Token', required: true })
  token1: Types.ObjectId;

  @Prop()
  block?: string;

  @Prop({ required: true })
  address: string;

  @Prop({required: true})
  protocolString: string;
}

export const PoolSchema = SchemaFactory.createForClass(Pool);

// Add indexes
PoolSchema.index({ token0: 1 });
PoolSchema.index({ token1: 1 });
PoolSchema.index({ token0: 1, token1: 1, feeTier: 1 }, { unique: true });
PoolSchema.index({ address: 1 }, { unique: true });
