import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IInboxRepository } from '@domain/repositories/inbox.repository.interface';
import { DiscardSuggestionDto } from '@application/dtos/inbox.dto';

@Injectable()
export class DiscardSuggestionUseCase {
  constructor(
    @Inject('IInboxRepository')
    private readonly inboxRepository: IInboxRepository,
  ) {}

  async execute(
    userId: string,
    inboxItemId: string,
    dto: DiscardSuggestionDto,
  ): Promise<{ success: boolean }> {
    const inboxItem = await this.inboxRepository.findById(inboxItemId);

    if (!inboxItem) {
      throw new NotFoundException(`Inbox item with ID ${inboxItemId} not found`);
    }

    if (inboxItem.userId !== userId) {
      throw new ForbiddenException('You do not have access to this inbox item');
    }

    inboxItem.suggestions = inboxItem.suggestions.filter(
      (s) => s.id !== dto.suggestionId,
    );

    await this.inboxRepository.update(inboxItem);

    return { success: true };
  }
}

