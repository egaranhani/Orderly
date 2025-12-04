import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IPriorityRepository } from '@domain/repositories/priority.repository.interface';
import { ITaskRepository } from '@domain/repositories/task.repository.interface';
import { PriorityResponseDto } from '@application/dtos/priority.dto';

@Injectable()
export class GetPriorityUseCase {
  constructor(
    @Inject('IPriorityRepository')
    private readonly priorityRepository: IPriorityRepository,
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(userId: string, priorityId: string): Promise<PriorityResponseDto> {
    const priority = await this.priorityRepository.findById(priorityId);

    if (!priority) {
      throw new NotFoundException(`Priority with ID ${priorityId} not found`);
    }

    if (priority.userId !== userId) {
      throw new ForbiddenException('You do not have access to this priority');
    }

    const openTasks = await this.taskRepository.findByPriorityId(priorityId, {
      status: undefined,
    });
    const taskCount = openTasks.filter((t) => t.status === 'open' || t.status === 'in_progress').length;

    return {
      ...this.mapToResponse(priority),
      taskCount,
    };
  }

  private mapToResponse(priority: any): PriorityResponseDto {
    return {
      id: priority.id,
      userId: priority.userId,
      title: priority.title,
      description: priority.description,
      quadrant: priority.quadrant,
      tags: priority.tags,
      status: priority.status,
      origin: priority.origin,
      displayOrder: priority.displayOrder,
      createdAt: priority.createdAt,
      updatedAt: priority.updatedAt,
    };
  }
}

