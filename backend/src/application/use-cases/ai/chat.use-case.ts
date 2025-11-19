import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IConversationRepository } from '@domain/repositories/conversation.repository.interface';
import { ChatRequestDto, ChatResponseDto } from '@application/dtos/ai.dto';
import { IAiService } from '@domain/services/ai.service.interface';

@Injectable()
export class ChatUseCase {
  constructor(
    @Inject('IConversationRepository')
    private readonly conversationRepository: IConversationRepository,
    @Inject('IAiService')
    private readonly aiService: IAiService,
  ) {}

  async execute(dto: ChatRequestDto): Promise<ChatResponseDto> {
    const conversation = await this.conversationRepository.findById(
      dto.conversationId,
    );

    if (!conversation) {
      throw new NotFoundException(
        `Conversation with ID ${dto.conversationId} not found`,
      );
    }

    conversation.addMessage('user', dto.message);

    const aiResponse = await this.aiService.generateResponse(
      conversation.messages,
    );

    conversation.addMessage('assistant', aiResponse);

    await this.conversationRepository.update(conversation);

    return {
      conversationId: conversation.id,
      message: aiResponse,
      timestamp: new Date(),
    };
  }
}

