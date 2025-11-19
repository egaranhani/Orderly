export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  messages: Message[];
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface CreateConversationDto {
  title: string;
}

export interface ChatRequestDto {
  conversationId: string;
  message: string;
}

export interface ChatResponseDto {
  conversationId: string;
  message: string;
  timestamp: string;
}

