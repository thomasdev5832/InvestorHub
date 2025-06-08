import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'migrations', timestamps: true })
export class Migration extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  executedAt: Date;
}

export const MigrationSchema = SchemaFactory.createForClass(Migration); 