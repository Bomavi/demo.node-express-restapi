import { type HydratedDocument, Types } from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { User } from 'src/api/user/schema/user.schema';

@Schema({ timestamps: true, id: true })
export class Task {
  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  completed: boolean;

  @Prop({ required: true, ref: User.name })
  createdBy: Types.ObjectId;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

export type TaskDocument = HydratedDocument<Task>;
