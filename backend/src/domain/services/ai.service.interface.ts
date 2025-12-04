import { Message } from '../entities/conversation.entity';
import { ActionSuggestion } from '../entities/inbox-item.entity';

export interface ProcessInboxResult {
  suggestions: ActionSuggestion[];
}

export interface IAiService {
  generateResponse(messages: Message[]): Promise<string>;
  processInbox(meetingTitle: string | undefined, meetingContent: string): Promise<ProcessInboxResult>;
}

