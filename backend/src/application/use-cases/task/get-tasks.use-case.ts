import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IPriorityRepository } from '@domain/repositories/priority.repository.interface';
import { ITaskRepository } from '@domain/repositories/task.repository.interface';
import { TaskClassification, TaskStatus } from '@domain/entities/task.entity';
import { TaskResponseDto } from '@application/dtos/task.dto';

@Injectable()
export class GetTasksUseCase {
  constructor(
    @Inject('IPriorityRepository')
    private readonly priorityRepository: IPriorityRepository,
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(
    userId: string,
    priorityId: string,
    filters?: {
      classification?: TaskClassification;
      status?: TaskStatus;
    },
  ): Promise<TaskResponseDto[]> {
    const priority = await this.priorityRepository.findById(priorityId);

    if (!priority) {
      throw new NotFoundException(`Priority with ID ${priorityId} not found`);
    }

    if (priority.userId !== userId) {
      throw new ForbiddenException('You do not have access to this priority');
    }

    const tasks = await this.taskRepository.findByPriorityId(priorityId, filters);
    return tasks.map((task) => this.mapToResponse(task));
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

