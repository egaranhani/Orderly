export class ChatRequestDto {
  conversationId: string;
  message: string;
}

export class ChatResponseDto {
  conversationId: string;
  message: string;
  timestamp: Date;
}

