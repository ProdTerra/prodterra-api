import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'users', versionKey: false, timestamps: true })
export class UserDocument {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ type: String, default: null })
  passwordHash!: string | null;

  @Prop({ type: String, default: null })
  avatarKey!: string | null;

  @Prop({ type: String, default: null, index: { unique: true, partialFilterExpression: { googleId: { $type: 'string' } } } })
  googleId!: string | null;
}
export const UserSchema = SchemaFactory.createForClass(UserDocument);
