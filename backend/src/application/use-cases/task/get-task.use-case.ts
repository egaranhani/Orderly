import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ITaskRepository } from '@domain/repositories/task.repository.interface';
import { TaskResponseDto } from '@application/dtos/task.dto';

@Injectable()
export class GetTaskUseCase {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(userId: string, taskId: string): Promise<TaskResponseDto> {
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    if (task.userId !== userId) {
      throw new ForbiddenException('You do not have access to this task');
    }

    return this.mapToResponse(task);
  }

  private mapToResponse(task: any): TaskResponseDto {
    return {
      id: task.id,
      userId: task.userId,
      priorityId: task.priorityId,
      title: task.title,
      description: task.description,
      classification: task.classification,
      idealDate: task.idealDate,
      responsible: task.responsible,
      status: task.status,
      origin: task.origin,
      meetingReference: task.meetingReference,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
}

