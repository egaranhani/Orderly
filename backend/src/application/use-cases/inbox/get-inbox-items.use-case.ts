import { Injectable, Inject } from '@nestjs/common';
import { IInboxRepository } from '@domain/repositories/inbox.repository.interface';
import { InboxItemStatus } from '@domain/entities/inbox-item.entity';
import { InboxItemResponseDto, ActionSuggestionDto } from '@application/dtos/inbox.dto';

@Injectable()
export class GetInboxItemsUseCase {
  constructor(
    @Inject('IInboxRepository')
    private readonly inboxRepository: IInboxRepository,
  ) {}

  async execute(
    userId: string,
    filters?: { status?: InboxItemStatus },
  ): Promise<InboxItemResponseDto[]> {
    const items = await this.inboxRepository.findByUserId(userId, filters);
    return items.map((item) => this.mapToResponse(item));
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

