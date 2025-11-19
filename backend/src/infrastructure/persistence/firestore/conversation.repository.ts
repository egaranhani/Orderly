import { Injectable } from '@nestjs/common';
import { Firestore } from '@google-cloud/firestore';
import { Conversation, Message } from '@domain/entities/conversation.entity';
import { IConversationRepository } from '@domain/repositories/conversation.repository.interface';

@Injectable()
export class FirestoreConversationRepository
  implements IConversationRepository
{
  private readonly collection: FirebaseFirestore.CollectionReference;

  constructor(private readonly firestore: Firestore) {
    this.collection = this.firestore.collection('conversations');
  }

  async findById(id: string): Promise<Conversation | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return this.mapToEntity(doc.id, doc.data());
  }

  async findByUserId(userId: string): Promise<Conversation[]> {
    const snapshot = await this.collection
      .where('userId', '==', userId)
      .orderBy('updatedAt', 'desc')
      .get();

    return snapshot.docs.map((doc) => this.mapToEntity(doc.id, doc.data()));
  }

  async create(conversation: Conversation): Promise<Conversation> {
    const docRef = this.collection.doc(conversation.id);
    await docRef.set(this.mapToFirestore(conversation));
    return conversation;
  }

  async update(conversation: Conversation): Promise<Conversation> {
    conversation.updateTimestamp();
    await this.collection
      .doc(conversation.id)
      .update(this.mapToFirestore(conversation));
    return conversation;
  }

  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }

  private mapToEntity(
    id: string,
    data: FirebaseFirestore.DocumentData,
  ): Conversation {
    const conversation = new Conversation(
      data.userId,
      data.title,
      id,
    );
    conversation.messages = (data.messages || []).map((msg: any) => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp.toDate(),
    }));
    conversation.status = data.status;
    conversation.createdAt = data.createdAt.toDate();
    conversation.updatedAt = data.updatedAt.toDate();
    return conversation;
  }

  private mapToFirestore(conversation: Conversation): any {
    return {
      userId: conversation.userId,
      title: conversation.title,
      messages: conversation.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      })),
      status: conversation.status,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }
}

