import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'network_configs', timestamps: true })
export class NetworkConfig extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  chainId: number;

  @Prop({ required: true })
  rpcUrl: string;

  @Prop({ required: true })
  graphqlUrl: string;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true })
  positionManagerAddress: string;

  @Prop({ required: true })
  factoryAddress: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const NetworkConfigSchema = SchemaFactory.createForClass(NetworkConfig);

// Add indexes
NetworkConfigSchema.index({ chainId: 1 }, { unique: true }); 