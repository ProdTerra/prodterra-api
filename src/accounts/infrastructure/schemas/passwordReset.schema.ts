import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'passwordResets', versionKey: false })
export class PasswordResetDocument {
  @Prop({ required: true, unique: true })
  tokenHash!: string;

  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true })
  expiresAt!: Date;
}
export const PasswordResetSchema = SchemaFactory.createForClass(PasswordResetDocument);
PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
