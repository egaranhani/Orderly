import { Injectable, Inject } from '@nestjs/common';
import { IPriorityRepository } from '@domain/repositories/priority.repository.interface';
import { ITaskRepository } from '@domain/repositories/task.repository.interface';
import { PriorityStatus, EisenhowerQuadrant, PriorityOrigin } from '@domain/entities/priority.entity';
import { PriorityResponseDto } from '@application/dtos/priority.dto';

@Injectable()
export class GetPrioritiesUseCase {
  constructor(
    @Inject('IPriorityRepository')
    private readonly priorityRepository: IPriorityRepository,
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(
    userId: string,
    filters?: {
      status?: PriorityStatus;
      quadrant?: EisenhowerQuadrant;
      tags?: string[];
      origin?: PriorityOrigin;
    },
  ): Promise<PriorityResponseDto[]> {
    const priorities = await this.priorityRepository.findByUserId(userId, filters);

    const prioritiesWithTaskCount = await Promise.all(
      priorities.map(async (priority) => {
        const openTasks = await this.taskRepository.findByPriorityId(priority.id, {
          status: undefined,
        });
        const taskCount = openTasks.filter((t) => t.status === 'open' || t.status === 'in_progress').length;

        return {
          ...this.mapToResponse(priority),
          taskCount,
        };
      }),
    );

    return prioritiesWithTaskCount;
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

