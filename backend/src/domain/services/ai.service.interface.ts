import { Message } from '../entities/conversation.entity';

export interface IAiService {
  generateResponse(messages: Message[]): Promise<string>;
}

