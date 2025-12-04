import { Injectable, Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { IPriorityRepository } from '@domain/repositories/priority.repository.interface';
import { ReorderPrioritiesDto } from '@application/dtos/priority.dto';

@Injectable()
export class ReorderPrioritiesUseCase {
  constructor(
    @Inject('IPriorityRepository')
    private readonly priorityRepository: IPriorityRepository,
  ) {}

  async execute(
    userId: string,
    quadrant: string,
    dto: ReorderPrioritiesDto,
  ): Promise<{ success: boolean }> {
    if (!dto.priorityIds || dto.priorityIds.length === 0) {
      throw new BadRequestException('priorityIds array cannot be empty');
    }

    const priorities = await Promise.all(
      dto.priorityIds.map((id) => this.priorityRepository.findById(id)),
    );

    for (const priority of priorities) {
      if (!priority) {
        throw new NotFoundException(`Priority not found`);
      }
      if (priority.userId !== userId) {
        throw new ForbiddenException('You do not have access to this priority');
      }
      if (priority.quadrant !== quadrant) {
        throw new BadRequestException('All priorities must be in the same quadrant');
      }
    }

    for (let i = 0; i < dto.priorityIds.length; i++) {
      await this.priorityRepository.updateDisplayOrder(dto.priorityIds[i], i);
    }

    return { success: true };
  }
}

