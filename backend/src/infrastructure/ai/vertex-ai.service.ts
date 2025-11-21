import { Injectable } from '@nestjs/common';
import { ChatVertexAI } from '@langchain/google-vertexai';
import { Message } from '@domain/entities/conversation.entity';
import { IAiService } from '@domain/services/ai.service.interface';

@Injectable()
export class VertexAiService implements IAiService {
  private readonly model: ChatVertexAI;

  constructor() {
    this.model = new ChatVertexAI({
      model: 'gemini-2.0-flash-exp',
      temperature: 0.7,
      location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
    });
  }

  async generateResponse(messages: Message[]): Promise<string> {
    const formattedMessages = messages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      content: msg.content,
    }));

    const response = await this.model.invoke(formattedMessages);
    return response.content as string;
  }
}

