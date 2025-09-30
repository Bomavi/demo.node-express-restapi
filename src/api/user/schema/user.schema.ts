import { type HydratedDocument } from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true, id: true })
export class User {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: false, default: 'light' })
  theme: string;
}

export const PUBLIC_USER_FIELDS: (keyof UserDocument)[] = [
  'id',
  'email',
  'username',
  'theme',
];

export const UserSchema = SchemaFactory.createForClass(User);

export type UserDocument = HydratedDocument<User>;
export type PublicUserData = Omit<UserDocument, 'passwordHash'>;
