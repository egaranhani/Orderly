import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ITaskRepository } from '@domain/repositories/task.repository.interface';

@Injectable()
export class DeleteTaskUseCase {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(userId: string, taskId: string): Promise<{ success: boolean }> {
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    if (task.userId !== userId) {
      throw new ForbiddenException('You do not have access to this task');
    }

    await this.taskRepository.delete(taskId);

    return { success: true };
  }
}

