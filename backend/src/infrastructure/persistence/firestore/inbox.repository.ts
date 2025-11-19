import { Injectable } from '@nestjs/common';
import { Firestore } from '@google-cloud/firestore';
import { InboxItem, InboxItemStatus, ActionSuggestion } from '@domain/entities/inbox-item.entity';
import { IInboxRepository } from '@domain/repositories/inbox.repository.interface';

@Injectable()
export class FirestoreInboxRepository implements IInboxRepository {
  private readonly collection: FirebaseFirestore.CollectionReference;

  constructor(private readonly firestore: Firestore) {
    this.collection = this.firestore.collection('inbox');
  }

  async findById(id: string): Promise<InboxItem | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return this.mapToEntity(doc.id, doc.data());
  }

  async findByUserId(userId: string, filters?: { status?: InboxItemStatus }): Promise<InboxItem[]> {
    let query: FirebaseFirestore.Query = this.collection.where('userId', '==', userId);

    if (filters?.status) {
      query = query.where('status', '==', filters.status);
    }

    query = query.orderBy('createdAt', 'desc');

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => this.mapToEntity(doc.id, doc.data()));
  }

  async create(inboxItem: InboxItem): Promise<InboxItem> {
    const docRef = this.collection.doc(inboxItem.id);
    await docRef.set(this.mapToFirestore(inboxItem));
    return inboxItem;
  }

  async update(inboxItem: InboxItem): Promise<InboxItem> {
    inboxItem.updateTimestamp();
    await this.collection.doc(inboxItem.id).update(this.mapToFirestore(inboxItem));
    return inboxItem;
  }

  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }

  private mapToEntity(id: string, data: FirebaseFirestore.DocumentData): InboxItem {
    const suggestions = (data.suggestions || []).map((s: any) => {
      return new ActionSuggestion(
        s.id,
        s.actionSummary,
        s.suggestedPriority,
        {
          ...s.suggestedTask,
          idealDate: s.suggestedTask?.idealDate ? s.suggestedTask.idealDate.toDate() : undefined,
        },
        s.meetingReference,
        s.relevantText,
      );
    });

    const inboxItem = new InboxItem(
      data.userId,
      data.meetingContent,
      data.status || InboxItemStatus.PENDING,
      suggestions,
      data.meetingTitle,
      data.processedAt ? data.processedAt.toDate() : undefined,
      id,
    );

    if (data.createdAt) {
      inboxItem.createdAt = data.createdAt.toDate();
    }
    if (data.updatedAt) {
      inboxItem.updatedAt = data.updatedAt.toDate();
    }

    return inboxItem;
  }

  private mapToFirestore(inboxItem: InboxItem): any {
    return {
      userId: inboxItem.userId,
      meetingTitle: inboxItem.meetingTitle,
      meetingContent: inboxItem.meetingContent,
      status: inboxItem.status,
      suggestions: inboxItem.suggestions.map((s) => ({
        id: s.id,
        relevantText: s.relevantText,
        actionSummary: s.actionSummary,
        suggestedPriority: s.suggestedPriority,
        suggestedTask: {
          ...s.suggestedTask,
          idealDate: s.suggestedTask.idealDate,
        },
        meetingReference: s.meetingReference,
      })),
      processedAt: inboxItem.processedAt,
      createdAt: inboxItem.createdAt,
      updatedAt: inboxItem.updatedAt,
    };
  }
}

