import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IPriorityRepository } from '@domain/repositories/priority.repository.interface';

@Injectable()
export class DeletePriorityUseCase {
  constructor(
    @Inject('IPriorityRepository')
    private readonly priorityRepository: IPriorityRepository,
  ) {}

  async execute(userId: string, priorityId: string): Promise<{ success: boolean }> {
    const priority = await this.priorityRepository.findById(priorityId);

    if (!priority) {
      throw new NotFoundException(`Priority with ID ${priorityId} not found`);
    }

    if (priority.userId !== userId) {
      throw new ForbiddenException('You do not have access to this priority');
    }

    await this.priorityRepository.delete(priorityId);

    return { success: true };
  }
}

