// src/tasks/tasks.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete, Query, UsePipes, ValidationPipe, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task } from './task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async getAllTasks(
    @Request() req,
    @Query('status') status?: string,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
    @Query('sortBy') sortBy?: string,
  ): Promise<{ data: Task[]; total: number }> {
    console.log('TasksController - getAllTasks called');
    console.log('Request Query:', req.query); // Added for debugging
    return await this.tasksService.getAllTasks(req.user.userId, status, page, limit, sortBy);
  }

  @Get(':id')
  async getTaskById(@Request() req, @Param('id') id: string): Promise<Task | null> {
    return await this.tasksService.getTaskById(req.user.userId, id);
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async createTask(@Request() req, @Body() createTaskDto: CreateTaskDto): Promise<Task> {
    return await this.tasksService.createTask(req.user.userId, createTaskDto);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateTask(@Request() req, @Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto): Promise<Task | null> {
    return await this.tasksService.updateTask(req.user.userId, id, updateTaskDto);
  }

  @Delete(':id')
  async deleteTask(@Request() req, @Param('id') id: string): Promise<{ success: boolean }> {
    const deleted = await this.tasksService.deleteTask(req.user.userId, id);
    return { success: deleted };
  }
}