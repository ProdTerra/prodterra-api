import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LocalizedNameSchema, SourceSchema, type LocalizedNameDocument, type SourceDocument } from './catalogSubdocuments.js';

@Schema({ collection: 'plantFamilies', versionKey: false })
export class PlantFamilyDocument {
  @Prop({ required: true, unique: true })
  key!: string;

  @Prop({ required: true })
  scientificName!: string;

  @Prop({ type: LocalizedNameSchema, required: true })
  name!: LocalizedNameDocument;

  @Prop({ type: [SourceSchema], default: [] })
  sources!: SourceDocument[];
}
export const PlantFamilySchema = SchemaFactory.createForClass(PlantFamilyDocument);
