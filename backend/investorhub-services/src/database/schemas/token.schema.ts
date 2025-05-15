import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'tokens', timestamps: true })
export class Token extends Document {

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  symbol: string;

  @Prop()
  imageUrl?: string;
}

export const TokenSchema = SchemaFactory.createForClass(Token);

// Add indexes
TokenSchema.index({ id: 1 });
TokenSchema.index({ symbol: 1 });
