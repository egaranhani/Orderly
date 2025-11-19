export class CreateConversationDto {
  title: string;
}

export class AddMessageDto {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class ConversationResponseDto {
  id: string;
  userId: string;
  title: string;
  messages: MessageDto[];
  status: 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export class MessageDto {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

