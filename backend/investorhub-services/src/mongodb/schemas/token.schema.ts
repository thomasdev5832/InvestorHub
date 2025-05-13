import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Token extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  symbol: string;

  @Prop({ required: true, unique: true, index: true })
  address: string;

  @Prop()
  imageUrl: string;
}

export const TokenSchema = SchemaFactory.createForClass(Token); 