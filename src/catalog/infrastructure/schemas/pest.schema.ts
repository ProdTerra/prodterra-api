import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { pestTypes, type PestType } from '../../domain/pest.js';
import {
  LocalizedNameSchema,
  RangeSchema,
  SourceSchema,
  type LocalizedNameDocument,
  type RangeDocument,
  type SourceDocument,
} from './catalogSubdocuments.js';

@Schema({ collection: 'pests', versionKey: false })
export class PestDocument {
  @Prop({ required: true, unique: true })
  key!: string;

  @Prop({ type: LocalizedNameSchema, required: true })
  name!: LocalizedNameDocument;

  @Prop({ required: true })
  scientificName!: string;

  @Prop({ type: String, enum: pestTypes, required: true })
  type!: PestType;

  @Prop({ type: RangeSchema, default: () => ({}) })
  temperatureInCelsius!: RangeDocument;

  @Prop({ type: RangeSchema, default: () => ({}) })
  relativeHumidityInPercent!: RangeDocument;

  @Prop({ type: [String], default: [], index: true })
  affectedFamilyKeys!: string[];

  @Prop({ type: [String], default: [] })
  onlyAffectsCropKeys!: string[];

  @Prop({ type: [SourceSchema], default: [] })
  sources!: SourceDocument[];
}
export const PestSchema = SchemaFactory.createForClass(PestDocument);
