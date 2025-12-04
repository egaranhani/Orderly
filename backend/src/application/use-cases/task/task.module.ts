import { Module } from '@nestjs/common';
import { FirestoreModule } from '@infrastructure/persistence/firestore/firestore.module';
import { CreateTaskUseCase } from './create-task.use-case';
import { GetTasksUseCase } from './get-tasks.use-case';
import { GetTaskUseCase } from './get-task.use-case';
import { UpdateTaskUseCase } from './update-task.use-case';
import { MoveTaskUseCase } from './move-task.use-case';
import { CompleteTaskUseCase } from './complete-task.use-case';
import { CancelTaskUseCase } from './cancel-task.use-case';
import { DeleteTaskUseCase } from './delete-task.use-case';

@Module({
  imports: [FirestoreModule],
  providers: [
    CreateTaskUseCase,
    GetTasksUseCase,
    GetTaskUseCase,
    UpdateTaskUseCase,
    MoveTaskUseCase,
    CompleteTaskUseCase,
    CancelTaskUseCase,
    DeleteTaskUseCase,
  ],
  exports: [
    CreateTaskUseCase,
    GetTasksUseCase,
    GetTaskUseCase,
    UpdateTaskUseCase,
    MoveTaskUseCase,
    CompleteTaskUseCase,
    CancelTaskUseCase,
    DeleteTaskUseCase,
  ],
})
export class TaskModule {}

