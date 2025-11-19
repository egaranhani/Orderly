import { Injectable, Inject } from '@nestjs/common';
import { Conversation } from '@domain/entities/conversation.entity';
import { IConversationRepository } from '@domain/repositories/conversation.repository.interface';
import { CreateConversationDto, ConversationResponseDto } from '@application/dtos/conversation.dto';

@Injectable()
export class CreateConversationUseCase {
  constructor(
    @Inject('IConversationRepository')
    private readonly conversationRepository: IConversationRepository,
  ) {}

  async execute(
    userId: string,
    dto: CreateConversationDto,
  ): Promise<ConversationResponseDto> {
    const conversation = new Conversation(userId, dto.title);
    const created = await this.conversationRepository.create(conversation);
    return this.mapToResponse(created);
  }

  private mapToResponse(conversation: Conversation): ConversationResponseDto {
    return {
      id: conversation.id,
      userId: conversation.userId,
      title: conversation.title,
      messages: conversation.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      })),
      status: conversation.status,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }
}

