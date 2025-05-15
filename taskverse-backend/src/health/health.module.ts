// src/health/health.module.ts
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from '../tasks/task.schema';

@Module({
  imports: [
    TerminusModule, // Import the TerminusModule
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
  ],
  controllers: [HealthController],
  providers: [], // HealthCheckService and MongooseHealthIndicator are provided by TerminusModule
})
export class HealthModule {}