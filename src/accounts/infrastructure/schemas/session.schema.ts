import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'sessions', versionKey: false })
export class SessionDocument {
  @Prop({ required: true, unique: true })
  tokenHash!: string;

  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true })
  createdAt!: Date;

  @Prop({ required: true })
  expiresAt!: Date;
}
export const SessionSchema = SchemaFactory.createForClass(SessionDocument);
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
