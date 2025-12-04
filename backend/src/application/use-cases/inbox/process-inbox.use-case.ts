import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IInboxRepository } from '@domain/repositories/inbox.repository.interface';
import { InboxItem, InboxItemStatus } from '@domain/entities/inbox-item.entity';
import { ProcessInboxDto, InboxItemResponseDto, ActionSuggestionDto } from '@application/dtos/inbox.dto';

@Injectable()
export class ProcessInboxUseCase {
  constructor(
    @Inject('IInboxRepository')
    private readonly inboxRepository: IInboxRepository,
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

    inboxItem.status = InboxItemStatus.PROCESSED;
    inboxItem.processedAt = new Date();

    const suggestions: ActionSuggestionDto[] = [];

    inboxItem.suggestions = [];
    inboxItem.processedAt = new Date();

    await this.inboxRepository.update(inboxItem);

    return {
      inboxItemId: created.id,
      suggestions,
    };
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

