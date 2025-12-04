import { Injectable, Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { IInboxRepository } from '@domain/repositories/inbox.repository.interface';
import { IPriorityRepository } from '@domain/repositories/priority.repository.interface';
import { ITaskRepository } from '@domain/repositories/task.repository.interface';
import { InboxItemStatus } from '@domain/entities/inbox-item.entity';
import { EisenhowerQuadrant, PriorityOrigin } from '@domain/entities/priority.entity';
import { TaskOrigin, TaskStatus } from '@domain/entities/task.entity';
import { AcceptSuggestionDto } from '@application/dtos/inbox.dto';
import { PriorityResponseDto } from '@application/dtos/priority.dto';
import { TaskResponseDto } from '@application/dtos/task.dto';

@Injectable()
export class AcceptSuggestionUseCase {
  constructor(
    @Inject('IInboxRepository')
    private readonly inboxRepository: IInboxRepository,
    @Inject('IPriorityRepository')
    private readonly priorityRepository: IPriorityRepository,
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(
    userId: string,
    inboxItemId: string,
    dto: AcceptSuggestionDto,
  ): Promise<{ priority: PriorityResponseDto; task: TaskResponseDto }> {
    const inboxItem = await this.inboxRepository.findById(inboxItemId);

    if (!inboxItem) {
      throw new NotFoundException(`Inbox item with ID ${inboxItemId} not found`);
    }

    if (inboxItem.userId !== userId) {
      throw new ForbiddenException('You do not have access to this inbox item');
    }

    if (inboxItem.status !== InboxItemStatus.PROCESSED) {
      throw new BadRequestException('Suggestion can only be accepted if inbox item is processed');
    }

    const suggestion = inboxItem.suggestions.find((s) => s.id === dto.suggestionId);

    if (!suggestion) {
      throw new NotFoundException(`Suggestion with ID ${dto.suggestionId} not found`);
    }

    let priority;
    if (dto.linkToExistingPriorityId) {
      priority = await this.priorityRepository.findById(dto.linkToExistingPriorityId);
      if (!priority || priority.userId !== userId) {
        throw new NotFoundException('Priority not found or access denied');
      }
    } else {
      const priorityData = {
        title: dto.adjustments?.priority?.title || suggestion.suggestedPriority.title,
        quadrant: dto.adjustments?.priority?.quadrant || suggestion.suggestedPriority.quadrant,
        tags: dto.adjustments?.priority?.tags || suggestion.suggestedPriority.tags,
      };

      const prioritiesInQuadrant = await this.priorityRepository.findByUserIdAndQuadrant(
        userId,
        priorityData.quadrant,
      );

      const { Prioridade } = await import('@domain/entities/priority.entity');
      priority = new Prioridade(
        userId,
        priorityData.title,
        priorityData.quadrant,
        priorityData.tags,
        undefined,
        PriorityOrigin.AI,
        prioritiesInQuadrant.length,
      );

      priority = await this.priorityRepository.create(priority);
    }

    const taskData = {
      title: dto.adjustments?.task?.title || suggestion.suggestedTask.title,
      classification: dto.adjustments?.task?.classification || suggestion.suggestedTask.classification,
      idealDate: dto.adjustments?.task?.idealDate || suggestion.suggestedTask.idealDate,
      responsible: dto.adjustments?.task?.responsible || suggestion.suggestedTask.responsible,
    };

    const { Tarefa } = await import('@domain/entities/task.entity');
    const task = new Tarefa(
      userId,
      priority.id,
      taskData.title,
      taskData.classification,
      TaskStatus.OPEN,
      TaskOrigin.AI,
      undefined,
      taskData.idealDate,
      taskData.responsible,
      inboxItem.meetingTitle || suggestion.meetingReference,
    );

    const createdTask = await this.taskRepository.create(task);

    return {
      priority: this.mapPriorityToResponse(priority),
      task: this.mapTaskToResponse(createdTask),
    };
  }

  private mapPriorityToResponse(priority: any): PriorityResponseDto {
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

  private mapTaskToResponse(task: any): TaskResponseDto {
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

