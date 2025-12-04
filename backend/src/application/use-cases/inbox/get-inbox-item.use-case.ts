import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IInboxRepository } from '@domain/repositories/inbox.repository.interface';
import { InboxItemResponseDto, ActionSuggestionDto } from '@application/dtos/inbox.dto';

@Injectable()
export class GetInboxItemUseCase {
  constructor(
    @Inject('IInboxRepository')
    private readonly inboxRepository: IInboxRepository,
  ) {}

  async execute(userId: string, inboxItemId: string): Promise<InboxItemResponseDto> {
    const item = await this.inboxRepository.findById(inboxItemId);

    if (!item) {
      throw new NotFoundException(`Inbox item with ID ${inboxItemId} not found`);
    }

    if (item.userId !== userId) {
      throw new ForbiddenException('You do not have access to this inbox item');
    }

    return this.mapToResponse(item);
  }

  private mapToResponse(item: any): InboxItemResponseDto {
    return {
      id: item.id,
      userId: item.userId,
      meetingTitle: item.meetingTitle,
      meetingContent: item.meetingContent,
      status: item.status,
      suggestions: item.suggestions.map((s: any) => this.mapSuggestion(s)),
      processedAt: item.processedAt,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  private mapSuggestion(suggestion: any): ActionSuggestionDto {
    return {
      id: suggestion.id,
      relevantText: suggestion.relevantText,
      actionSummary: suggestion.actionSummary,
      suggestedPriority: suggestion.suggestedPriority,
      suggestedTask: suggestion.suggestedTask,
      meetingReference: suggestion.meetingReference,
    };
  }
}

