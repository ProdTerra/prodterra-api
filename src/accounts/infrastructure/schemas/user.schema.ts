import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'users', versionKey: false, timestamps: true })
export class UserDocument {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;
}
export const UserSchema = SchemaFactory.createForClass(UserDocument);
