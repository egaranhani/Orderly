import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IPriorityRepository } from '@domain/repositories/priority.repository.interface';
import { Prioridade, EisenhowerQuadrant, PriorityOrigin } from '@domain/entities/priority.entity';
import { CreatePriorityDto, PriorityResponseDto } from '@application/dtos/priority.dto';

@Injectable()
export class CreatePriorityUseCase {
  constructor(
    @Inject('IPriorityRepository')
    private readonly priorityRepository: IPriorityRepository,
  ) {}

  async execute(userId: string, dto: CreatePriorityDto): Promise<PriorityResponseDto> {
    this.validate(dto);

    const prioritiesInQuadrant = await this.priorityRepository.findByUserIdAndQuadrant(
      userId,
      dto.quadrant,
    );

    const displayOrder = prioritiesInQuadrant.length;

    const priority = new Prioridade(
      userId,
      dto.title,
      dto.quadrant,
      dto.tags || [],
      undefined,
      dto.origin || PriorityOrigin.MANUAL,
      displayOrder,
      dto.description,
    );

    const created = await this.priorityRepository.create(priority);
    return this.mapToResponse(created);
  }

  private validate(dto: CreatePriorityDto): void {
    if (!dto.title || dto.title.trim().length < 3) {
      throw new BadRequestException('Title must have at least 3 characters');
    }
    if (dto.title.length > 200) {
      throw new BadRequestException('Title must have at most 200 characters');
    }
    if (!Object.values(EisenhowerQuadrant).includes(dto.quadrant)) {
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

  private mapToResponse(priority: Prioridade): PriorityResponseDto {
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

