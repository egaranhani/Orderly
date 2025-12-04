import { Injectable, Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ITaskRepository } from '@domain/repositories/task.repository.interface';
import { TaskClassification } from '@domain/entities/task.entity';
import { MoveTaskDto, TaskResponseDto } from '@application/dtos/task.dto';

@Injectable()
export class MoveTaskUseCase {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(
    userId: string,
    taskId: string,
    dto: MoveTaskDto,
  ): Promise<TaskResponseDto> {
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    if (task.userId !== userId) {
      throw new ForbiddenException('You do not have access to this task');
    }

    if (dto.classification === TaskClassification.SCHEDULE && !dto.idealDate) {
      throw new BadRequestException('idealDate is required for schedule tasks');
    }

    if (dto.classification === TaskClassification.DELEGATE && !dto.responsible) {
      throw new BadRequestException('responsible is required for delegate tasks');
    }

    task.classification = dto.classification;
    if (dto.idealDate !== undefined) {
      task.idealDate = dto.idealDate;
    }
    if (dto.responsible !== undefined) {
      task.responsible = dto.responsible;
    }

    if (dto.classification !== TaskClassification.SCHEDULE) {
      task.idealDate = undefined;
    }
    if (dto.classification !== TaskClassification.DELEGATE) {
      task.responsible = undefined;
    }

    const updated = await this.taskRepository.update(task);
    return this.mapToResponse(updated);
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

