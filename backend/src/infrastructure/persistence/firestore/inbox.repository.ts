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
    if (!doc.exists || !doc.data()) {
      return null;
    }
    return this.mapToEntity(doc.id, doc.data()!);
  }

  async findByUserId(userId: string, filters?: { status?: InboxItemStatus }): Promise<InboxItem[]> {
    let query: FirebaseFirestore.Query = this.collection.where('userId', '==', userId);

    if (filters?.status) {
      query = query.where('status', '==', filters.status);
    }

    const snapshot = await query.get();
    const items = snapshot.docs.map((doc) => this.mapToEntity(doc.id, doc.data()));
    
    return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
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
    const data: any = {
      userId: inboxItem.userId,
      meetingContent: inboxItem.meetingContent,
      status: inboxItem.status,
      suggestions: inboxItem.suggestions.map((s) => {
        const suggestion: any = {
          id: s.id,
          actionSummary: s.actionSummary,
          suggestedPriority: s.suggestedPriority,
          suggestedTask: {
            title: s.suggestedTask.title,
            classification: s.suggestedTask.classification,
          },
          meetingReference: s.meetingReference,
        };

        if (s.relevantText !== undefined) {
          suggestion.relevantText = s.relevantText;
        }
        if (s.suggestedTask.idealDate !== undefined) {
          suggestion.suggestedTask.idealDate = s.suggestedTask.idealDate;
        }
        if (s.suggestedTask.responsible !== undefined) {
          suggestion.suggestedTask.responsible = s.suggestedTask.responsible;
        }

        return suggestion;
      }),
      createdAt: inboxItem.createdAt,
      updatedAt: inboxItem.updatedAt,
    };

    if (inboxItem.meetingTitle !== undefined) {
      data.meetingTitle = inboxItem.meetingTitle;
    }
    if (inboxItem.processedAt !== undefined) {
      data.processedAt = inboxItem.processedAt;
    }

    return data;
  }
}

