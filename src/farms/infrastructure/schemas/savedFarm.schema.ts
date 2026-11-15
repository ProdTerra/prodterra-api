import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

@Schema({ collection: 'savedFarms' })
export class SavedFarmDocument {
  @Prop({ required: true, index: true })
  ownerId!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  lotCount!: number;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  snapshot!: Record<string, unknown>;

  @Prop({ required: true })
  createdAt!: Date;

  @Prop({ required: true })
  updatedAt!: Date;
}

export const SavedFarmSchema = SchemaFactory.createForClass(SavedFarmDocument);
