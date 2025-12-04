import { Injectable, Inject, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { IInboxRepository } from '@domain/repositories/inbox.repository.interface';
import { IAiService } from '@domain/services/ai.service.interface';
import { InboxItem, InboxItemStatus } from '@domain/entities/inbox-item.entity';
import { ProcessInboxDto, ActionSuggestionDto } from '@application/dtos/inbox.dto';

@Injectable()
export class ProcessInboxUseCase {
  constructor(
    @Inject('IInboxRepository')
    private readonly inboxRepository: IInboxRepository,
    @Inject('IAiService')
    private readonly aiService: IAiService,
  ) {}

  async execute(
    userId: string,
    dto: ProcessInboxDto,
  ): Promise<{ inboxItemId: string; suggestions: ActionSuggestionDto[] }> {
    this.validate(dto);

    const inboxItem = new InboxItem(
      userId,
      dto.meetingContent,
      InboxItemStatus.PENDING,
      [],
      dto.meetingTitle,
    );

    const created = await this.inboxRepository.create(inboxItem);

    try {
      const aiResult = await this.aiService.processInbox(dto.meetingTitle, dto.meetingContent);

      inboxItem.status = InboxItemStatus.PROCESSED;
      inboxItem.processedAt = new Date();
      inboxItem.suggestions = aiResult.suggestions;

      await this.inboxRepository.update(inboxItem);

      const suggestionsDto: ActionSuggestionDto[] = aiResult.suggestions.map((suggestion) => ({
        id: suggestion.id,
        relevantText: suggestion.relevantText,
        actionSummary: suggestion.actionSummary,
        suggestedPriority: {
          title: suggestion.suggestedPriority.title,
          quadrant: suggestion.suggestedPriority.quadrant,
          tags: suggestion.suggestedPriority.tags,
        },
        suggestedTask: {
          title: suggestion.suggestedTask.title,
          classification: suggestion.suggestedTask.classification,
          idealDate: suggestion.suggestedTask.idealDate,
          responsible: suggestion.suggestedTask.responsible,
        },
        meetingReference: suggestion.meetingReference,
      }));

      return {
        inboxItemId: created.id,
        suggestions: suggestionsDto,
      };
    } catch (error) {
      inboxItem.status = InboxItemStatus.PENDING;
      await this.inboxRepository.update(inboxItem);

      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to process inbox: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private validate(dto: ProcessInboxDto): void {
    if (!dto.meetingContent || dto.meetingContent.trim().length < 10) {
      throw new BadRequestException('meetingContent must have at least 10 characters');
    }
    if (dto.meetingTitle && dto.meetingTitle.length > 200) {
      throw new BadRequestException('meetingTitle must have at most 200 characters');
    }
  }
}

