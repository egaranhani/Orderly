import { InboxItem, InboxItemStatus } from '../entities/inbox-item.entity';

export interface IInboxRepository {
  findById(id: string): Promise<InboxItem | null>;
  findByUserId(userId: string, filters?: { status?: InboxItemStatus }): Promise<InboxItem[]>;
  create(inboxItem: InboxItem): Promise<InboxItem>;
  update(inboxItem: InboxItem): Promise<InboxItem>;
  delete(id: string): Promise<void>;
}

