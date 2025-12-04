import { Injectable, Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { IPriorityRepository } from '@domain/repositories/priority.repository.interface';
import { EisenhowerQuadrant, PriorityStatus } from '@domain/entities/priority.entity';
import { UpdatePriorityDto, PriorityResponseDto } from '@application/dtos/priority.dto';

@Injectable()
export class UpdatePriorityUseCase {
  constructor(
    @Inject('IPriorityRepository')
    private readonly priorityRepository: IPriorityRepository,
  ) {}

  async execute(
    userId: string,
    priorityId: string,
    dto: UpdatePriorityDto,
  ): Promise<PriorityResponseDto> {
    const priority = await this.priorityRepository.findById(priorityId);

    if (!priority) {
      throw new NotFoundException(`Priority with ID ${priorityId} not found`);
    }

    if (priority.userId !== userId) {
      throw new ForbiddenException('You do not have access to this priority');
    }

    this.validate(dto);

    if (dto.title !== undefined) {
      priority.title = dto.title;
    }
    if (dto.description !== undefined) {
      priority.description = dto.description;
    }
    if (dto.quadrant !== undefined) {
      priority.quadrant = dto.quadrant;
    }
    if (dto.tags !== undefined) {
      priority.tags = dto.tags;
    }
    if (dto.status !== undefined) {
      priority.status = dto.status;
    }

    const updated = await this.priorityRepository.update(priority);
    return this.mapToResponse(updated);
  }

  private validate(dto: UpdatePriorityDto): void {
    if (dto.title !== undefined) {
      if (dto.title.trim().length < 3) {
        throw new BadRequestException('Title must have at least 3 characters');
      }
      if (dto.title.length > 200) {
        throw new BadRequestException('Title must have at most 200 characters');
      }
    }
    if (dto.quadrant !== undefined && !Object.values(EisenhowerQuadrant).includes(dto.quadrant)) {
      throw new BadRequestException('Invalid quadrant');
    }
    if (dto.tags) {
      for (const tag of dto.tags) {
        if (tag.length > 50) {
          throw new BadRequestException('Each tag must have at most 50 characters');
        }
      }
    }
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

