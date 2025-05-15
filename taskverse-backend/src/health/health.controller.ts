// src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, MongooseHealthIndicator } from '@nestjs/terminus';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from '../tasks/task.schema';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService, // Use HealthCheckService
    private mongoose: MongooseHealthIndicator, // Use MongooseHealthIndicator
    @InjectModel(Task.name) private taskModel: Model<Task>,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.mongoose.pingCheck('mongodb'),
      async () => {
        try {
          await this.taskModel.countDocuments({});
          return { tasks: { status: 'up' } };
        } catch (error) {
          return { tasks: { status: 'down', message: error.message } };
        }
      },
    ]);
  }
}