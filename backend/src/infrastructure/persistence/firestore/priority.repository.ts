import { Injectable } from '@nestjs/common';
import { Firestore } from '@google-cloud/firestore';
import { Prioridade, PriorityStatus, EisenhowerQuadrant, PriorityOrigin } from '@domain/entities/priority.entity';
import { IPriorityRepository } from '@domain/repositories/priority.repository.interface';

@Injectable()
export class FirestorePriorityRepository implements IPriorityRepository {
  private readonly collection: FirebaseFirestore.CollectionReference;

  constructor(private readonly firestore: Firestore) {
    this.collection = this.firestore.collection('priorities');
  }

  async findById(id: string): Promise<Prioridade | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists || !doc.data()) {
      return null;
    }
    return this.mapToEntity(doc.id, doc.data()!);
  }

  async findByUserId(
    userId: string,
    filters?: {
      status?: PriorityStatus;
      quadrant?: EisenhowerQuadrant;
      tags?: string[];
      origin?: PriorityOrigin;
    },
  ): Promise<Prioridade[]> {
    let query: FirebaseFirestore.Query = this.collection.where('userId', '==', userId);

    if (filters?.status) {
      query = query.where('status', '==', filters.status);
    }

    if (filters?.quadrant) {
      query = query.where('quadrant', '==', filters.quadrant);
    }

    if (filters?.origin) {
      query = query.where('origin', '==', filters.origin);
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.where('tags', 'array-contains-any', filters.tags);
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => this.mapToEntity(doc.id, doc.data()));
  }

  async findByUserIdAndQuadrant(userId: string, quadrant: EisenhowerQuadrant): Promise<Prioridade[]> {
    const snapshot = await this.collection
      .where('userId', '==', userId)
      .where('quadrant', '==', quadrant)
      .orderBy('displayOrder', 'asc')
      .get();

    return snapshot.docs.map((doc) => this.mapToEntity(doc.id, doc.data()));
  }

  async create(priority: Prioridade): Promise<Prioridade> {
    const docRef = this.collection.doc(priority.id);
    await docRef.set(this.mapToFirestore(priority));
    return priority;
  }

  async update(priority: Prioridade): Promise<Prioridade> {
    priority.updateTimestamp();
    await this.collection.doc(priority.id).update(this.mapToFirestore(priority));
    return priority;
  }

  async updateDisplayOrder(priorityId: string, displayOrder: number): Promise<void> {
    await this.collection.doc(priorityId).update({
      displayOrder,
      updatedAt: new Date(),
    });
  }

  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }

  private mapToEntity(id: string, data: FirebaseFirestore.DocumentData): Prioridade {
    const priority = new Prioridade(
      data.userId,
      data.title,
      data.quadrant,
      data.tags || [],
      data.status || PriorityStatus.ACTIVE,
      data.origin || PriorityOrigin.MANUAL,
      data.displayOrder || 0,
      data.description,
      id,
    );

    if (data.createdAt) {
      priority.createdAt = data.createdAt.toDate();
    }
    if (data.updatedAt) {
      priority.updatedAt = data.updatedAt.toDate();
    }

    return priority;
  }

  private mapToFirestore(priority: Prioridade): any {
    const data: any = {
      userId: priority.userId,
      title: priority.title,
      quadrant: priority.quadrant,
      tags: priority.tags,
      status: priority.status,
      origin: priority.origin,
      displayOrder: priority.displayOrder,
      createdAt: priority.createdAt,
      updatedAt: priority.updatedAt,
    };

    if (priority.description !== undefined) {
      data.description = priority.description;
    }

    return data;
  }
}

