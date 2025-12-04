import { Module } from '@nestjs/common';
import { PriorityModule as PriorityUseCaseModule } from '@application/use-cases/priority/priority.module';
import { TaskModule as TaskUseCaseModule } from '@application/use-cases/task/task.module';
import { PriorityController } from './priority.controller';

@Module({
  imports: [PriorityUseCaseModule, TaskUseCaseModule],
  controllers: [PriorityController],
})
export class PriorityControllerModule {}

