import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class RangeDocument {
  @Prop({ type: Number, default: null })
  minimum!: number | null;

  @Prop({ type: Number, default: null })
  maximum!: number | null;
}
export const RangeSchema = SchemaFactory.createForClass(RangeDocument);

@Schema({ _id: false })
export class LocalizedNameDocument {
  @Prop({ required: true })
  es!: string;

  @Prop({ type: String, required: false })
  en?: string;
}
export const LocalizedNameSchema = SchemaFactory.createForClass(LocalizedNameDocument);

@Schema({ _id: false })
export class SourceDocument {
  @Prop({ required: true })
  label!: string;

  @Prop({ type: String, default: null })
  url!: string | null;
}
export const SourceSchema = SchemaFactory.createForClass(SourceDocument);
