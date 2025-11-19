import { Injectable, Inject } from '@nestjs/common';
import { IConversationRepository } from '@domain/repositories/conversation.repository.interface';
import { ConversationResponseDto } from '@application/dtos/conversation.dto';
import { Conversation } from '@domain/entities/conversation.entity';

@Injectable()
export class GetConversationsUseCase {
  constructor(
    @Inject('IConversationRepository')
    private readonly conversationRepository: IConversationRepository,
  ) {}

  async execute(userId: string): Promise<ConversationResponseDto[]> {
    const conversations = await this.conversationRepository.findByUserId(userId);
    return conversations.map((conv) => this.mapToResponse(conv));
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

