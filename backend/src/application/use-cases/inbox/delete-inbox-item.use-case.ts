import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IInboxRepository } from '@domain/repositories/inbox.repository.interface';

@Injectable()
export class DeleteInboxItemUseCase {
  constructor(
    @Inject('IInboxRepository')
    private readonly inboxRepository: IInboxRepository,
  ) {}

  async execute(userId: string, inboxItemId: string): Promise<{ success: boolean }> {
    const inboxItem = await this.inboxRepository.findById(inboxItemId);

    if (!inboxItem) {
      throw new NotFoundException(`Inbox item with ID ${inboxItemId} not found`);
    }

    if (inboxItem.userId !== userId) {
      throw new ForbiddenException('You do not have access to this inbox item');
    }

    await this.inboxRepository.delete(inboxItemId);

    return { success: true };
  }
}

