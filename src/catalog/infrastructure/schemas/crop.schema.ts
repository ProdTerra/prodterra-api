import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { demandLevels, nutrients, type DemandLevel, type Nutrient } from '../../domain/crop.js';
import {
  LocalizedNameSchema,
  RangeSchema,
  SourceSchema,
  type LocalizedNameDocument,
  type RangeDocument,
  type SourceDocument,
} from './catalogSubdocuments.js';

@Schema({ _id: false })
export class NutrientDemandDocument {
  @Prop({ type: String, enum: nutrients, required: true })
  nutrient!: Nutrient;

  @Prop({ type: String, enum: demandLevels, required: false })
  level?: DemandLevel;
}
const NutrientDemandSchema = SchemaFactory.createForClass(NutrientDemandDocument);

@Schema({ collection: 'crops', versionKey: false })
export class CropDocument {
  @Prop({ required: true, unique: true })
  key!: string;

  @Prop({ type: LocalizedNameSchema, required: true })
  name!: LocalizedNameDocument;

  @Prop({ type: String, default: null })
  scientificName!: string | null;

  @Prop({ required: true, index: true })
  familyKey!: string;

  @Prop({ type: String, enum: [...demandLevels, null], default: null })
  demandLevel!: DemandLevel | null;

  @Prop({ type: [NutrientDemandSchema], default: [] })
  nutrients!: NutrientDemandDocument[];

  @Prop({ type: RangeSchema, default: () => ({}) })
  altitudeInMeters!: RangeDocument;

  @Prop({ type: RangeSchema, default: () => ({}) })
  temperatureInCelsius!: RangeDocument;

  @Prop({ type: RangeSchema, default: () => ({}) })
  waterNeedInMillimetersPerCycle!: RangeDocument;

  @Prop({ type: RangeSchema, default: () => ({}) })
  relativeHumidityInPercent!: RangeDocument;

  @Prop({ type: RangeSchema, default: () => ({}) })
  solarRadiationInKilowattHoursPerSquareMeterPerDay!: RangeDocument;

  @Prop({ type: RangeSchema, default: () => ({}) })
  cycleLengthInDays!: RangeDocument;

  @Prop({ type: [SourceSchema], default: [] })
  sources!: SourceDocument[];
}
export const CropSchema = SchemaFactory.createForClass(CropDocument);
