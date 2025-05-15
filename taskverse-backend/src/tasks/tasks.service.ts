// src/tasks/tasks.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from './task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private taskModel: Model<Task>) {}

  async getAllTasks(
    userId: string,
    status?: string,
    page: number = 1,
    limit: number = 10,
    sortBy?: string,
  ): Promise<{ data: Task[]; total: number }> {
    const skip = (page - 1) * limit;
    const query: any = { userId };
    if (status) {
      query.status = status;
    }
    const sortOptions: any = {};
    if (sortBy) {
      if (sortBy.startsWith('-')) {
        sortOptions[sortBy.substring(1)] = -1;
      } else {
        sortOptions[sortBy] = 1;
      }
    }

    console.log('getAllTasks - Query:', query);
    console.log('getAllTasks - Sort Options:', sortOptions);
    console.log('getAllTasks - Skip:', skip);
    console.log('getAllTasks - Limit:', limit);

    try {
      const tasks = await this.taskModel.find(query).skip(skip).limit(limit).sort(sortOptions).exec();
      const total = await this.taskModel.countDocuments(query).exec();
      console.log('getAllTasks - Found Tasks:', tasks);
      console.log('getAllTasks - Total Count:', total);
      return { data: tasks, total };
    } catch (error) {
      console.error('Error in getAllTasks:', error);
      throw error;
    }
  }

  async getTaskById(userId: string, id: string): Promise<Task | null> {
    const task = await this.taskModel.findOne({ _id: id, userId }).exec();
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found or does not belong to the user`);
    }
    return task;
  }

  async createTask(userId: string, createTaskDto: CreateTaskDto): Promise<Task> {
    const createdTask = new this.taskModel({ ...createTaskDto, userId });
    return createdTask.save();
  }

  async updateTask(userId: string, id: string, updateTaskDto: UpdateTaskDto): Promise<Task | null> {
    const updatedTask = await this.taskModel.findOneAndUpdate(
      { _id: id, userId },
      updateTaskDto,
      { new: true }, // Return the updated document
    ).exec();
    if (!updatedTask) {
      throw new NotFoundException(`Task with ID "${id}" not found or does not belong to the user`);
    }
    return updatedTask;
  }

  async deleteTask(userId: string, id: string): Promise<boolean> {
    const result = await this.taskModel.deleteOne({ _id: id, userId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Task with ID "${id}" not found or does not belong to the user`);
    }
    return true;
  }
}