import { Injectable, Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { IPriorityRepository } from '@domain/repositories/priority.repository.interface';
import { ITaskRepository } from '@domain/repositories/task.repository.interface';
import { Tarefa, TaskClassification, TaskOrigin, TaskStatus } from '@domain/entities/task.entity';
import { PriorityStatus } from '@domain/entities/priority.entity';
import { CreateTaskDto, TaskResponseDto } from '@application/dtos/task.dto';

@Injectable()
export class CreateTaskUseCase {
  constructor(
    @Inject('IPriorityRepository')
    private readonly priorityRepository: IPriorityRepository,
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(
    userId: string,
    priorityId: string,
    dto: CreateTaskDto,
  ): Promise<TaskResponseDto> {
    const priority = await this.priorityRepository.findById(priorityId);

    if (!priority) {
      throw new NotFoundException(`Priority with ID ${priorityId} not found`);
    }

    if (priority.userId !== userId) {
      throw new ForbiddenException('You do not have access to this priority');
    }

    if (priority.status === PriorityStatus.ARCHIVED) {
      throw new BadRequestException('Cannot create task in archived priority');
    }

    this.validate(dto);

    const task = new Tarefa(
      userId,
      priorityId,
      dto.title,
      dto.classification,
      TaskStatus.OPEN,
      dto.origin || TaskOrigin.MANUAL,
      dto.description,
      dto.idealDate,
      dto.responsible,
      dto.meetingReference,
    );

    const created = await this.taskRepository.create(task);
    return this.mapToResponse(created);
  }

  private validate(dto: CreateTaskDto): void {
    if (!dto.title || dto.title.trim().length < 3) {
      throw new BadRequestException('Title must have at least 3 characters');
    }
    if (dto.title.length > 200) {
      throw new BadRequestException('Title must have at most 200 characters');
    }
    if (!Object.values(TaskClassification).includes(dto.classification)) {
      throw new BadRequestException('Invalid classification');
    }
    if (dto.classification === TaskClassification.SCHEDULE && !dto.idealDate) {
      throw new BadRequestException('idealDate is required for schedule tasks');
    }
    if (dto.classification === TaskClassification.DELEGATE && !dto.responsible) {
      throw new BadRequestException('responsible is required for delegate tasks');
    }
  }

  private mapToResponse(task: Tarefa): TaskResponseDto {
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

