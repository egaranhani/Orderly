import { Module } from '@nestjs/common';
import { TaskModule as TaskUseCaseModule } from '@application/use-cases/task/task.module';
import { TaskController } from './task.controller';

@Module({
  imports: [TaskUseCaseModule],
  controllers: [TaskController],
})
export class TaskControllerModule {}

