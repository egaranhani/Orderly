import { Injectable, Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ITaskRepository } from '@domain/repositories/task.repository.interface';
import { TaskClassification, TaskStatus } from '@domain/entities/task.entity';
import { UpdateTaskDto, TaskResponseDto } from '@application/dtos/task.dto';

@Injectable()
export class UpdateTaskUseCase {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(
    userId: string,
    taskId: string,
    dto: UpdateTaskDto,
  ): Promise<TaskResponseDto> {
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    if (task.userId !== userId) {
      throw new ForbiddenException('You do not have access to this task');
    }

    this.validate(dto, task.classification);

    if (dto.title !== undefined) {
      task.title = dto.title;
    }
    if (dto.description !== undefined) {
      task.description = dto.description;
    }
    if (dto.classification !== undefined) {
      task.classification = dto.classification;
    }
    if (dto.idealDate !== undefined) {
      task.idealDate = dto.idealDate;
    }
    if (dto.responsible !== undefined) {
      task.responsible = dto.responsible;
    }
    if (dto.status !== undefined) {
      task.status = dto.status;
    }

    const updated = await this.taskRepository.update(task);
    return this.mapToResponse(updated);
  }

  private validate(dto: UpdateTaskDto, currentClassification: TaskClassification): void {
    if (dto.title !== undefined) {
      if (dto.title.trim().length < 3) {
        throw new BadRequestException('Title must have at least 3 characters');
      }
      if (dto.title.length > 200) {
        throw new BadRequestException('Title must have at most 200 characters');
      }
    }
    const classification = dto.classification || currentClassification;
    if (classification === TaskClassification.SCHEDULE && !dto.idealDate) {
      throw new BadRequestException('idealDate is required for schedule tasks');
    }
    if (classification === TaskClassification.DELEGATE && !dto.responsible) {
      throw new BadRequestException('responsible is required for delegate tasks');
    }
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

