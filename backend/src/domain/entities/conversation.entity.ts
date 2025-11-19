import { BaseEntity } from './base.entity';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export class Conversation extends BaseEntity {
  userId: string;
  title: string;
  messages: Message[];
  status: 'active' | 'archived';

  constructor(userId: string, title: string, id?: string) {
    super(id);
    this.userId = userId;
    this.title = title;
    this.messages = [];
    this.status = 'active';
  }

  addMessage(role: Message['role'], content: string): void {
    this.messages.push({
      role,
      content,
      timestamp: new Date(),
    });
    this.updateTimestamp();
  }
}

