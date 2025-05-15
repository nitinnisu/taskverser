// src/tasks/dto/update-task.dto.ts
import { IsOptional, IsString, IsEnum, IsDate } from 'class-validator';
import { TaskStatus, TaskPriority } from '../task.schema'; // Import the enums

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsDate()
  dueDate?: Date;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;
}