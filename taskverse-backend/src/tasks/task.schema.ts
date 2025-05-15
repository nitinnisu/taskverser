// src/tasks/task.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TaskDocument = Task & Document;

export enum TaskStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum TaskPriority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ default: TaskStatus.OPEN, enum: TaskStatus }) // Use the enum
  status: TaskStatus;

  @Prop({ required: true, type: String, ref: 'User' })
  userId: string;

  @Prop()
  dueDate?: Date;

  @Prop({ enum: TaskPriority }) // Use the enum
  priority?: TaskPriority;
}

export const TaskSchema = SchemaFactory.createForClass(Task);