import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IPriorityRepository } from '@domain/repositories/priority.repository.interface';
import { EisenhowerQuadrant } from '@domain/entities/priority.entity';
import { MovePriorityDto, PriorityResponseDto } from '@application/dtos/priority.dto';

@Injectable()
export class MovePriorityUseCase {
  constructor(
    @Inject('IPriorityRepository')
    private readonly priorityRepository: IPriorityRepository,
  ) {}

  async execute(
    userId: string,
    priorityId: string,
    dto: MovePriorityDto,
  ): Promise<PriorityResponseDto> {
    const priority = await this.priorityRepository.findById(priorityId);

    if (!priority) {
      throw new NotFoundException(`Priority with ID ${priorityId} not found`);
    }

    if (priority.userId !== userId) {
      throw new ForbiddenException('You do not have access to this priority');
    }

    const isChangingQuadrant = priority.quadrant !== dto.quadrant;

    if (isChangingQuadrant) {
      const prioritiesInNewQuadrant = await this.priorityRepository.findByUserIdAndQuadrant(
        userId,
        dto.quadrant,
      );
      const newDisplayOrder = dto.displayOrder !== undefined 
        ? dto.displayOrder 
        : prioritiesInNewQuadrant.length;
      
      priority.quadrant = dto.quadrant;
      priority.displayOrder = newDisplayOrder;
    } else if (dto.displayOrder !== undefined) {
      priority.displayOrder = dto.displayOrder;
    }

    const updated = await this.priorityRepository.update(priority);
    return this.mapToResponse(updated);
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

