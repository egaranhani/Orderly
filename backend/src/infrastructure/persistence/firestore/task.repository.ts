import { Injectable } from '@nestjs/common';
import { Firestore } from '@google-cloud/firestore';
import { Tarefa, TaskClassification, TaskStatus, TaskOrigin } from '@domain/entities/task.entity';
import { ITaskRepository } from '@domain/repositories/task.repository.interface';

@Injectable()
export class FirestoreTaskRepository implements ITaskRepository {
  private readonly collection: FirebaseFirestore.CollectionReference;

  constructor(private readonly firestore: Firestore) {
    this.collection = this.firestore.collection('tasks');
  }

  async findById(id: string): Promise<Tarefa | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists || !doc.data()) {
      return null;
    }
    return this.mapToEntity(doc.id, doc.data()!);
  }

  async findByPriorityId(
    priorityId: string,
    filters?: {
      classification?: TaskClassification;
      status?: TaskStatus;
    },
  ): Promise<Tarefa[]> {
    let query: FirebaseFirestore.Query = this.collection.where('priorityId', '==', priorityId);

    if (filters?.classification) {
      query = query.where('classification', '==', filters.classification);
    }

    if (filters?.status) {
      query = query.where('status', '==', filters.status);
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => this.mapToEntity(doc.id, doc.data()));
  }

  async findByUserId(userId: string, filters?: { status?: TaskStatus }): Promise<Tarefa[]> {
    let query: FirebaseFirestore.Query = this.collection.where('userId', '==', userId);

    if (filters?.status) {
      query = query.where('status', '==', filters.status);
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => this.mapToEntity(doc.id, doc.data()));
  }

  async create(task: Tarefa): Promise<Tarefa> {
    const docRef = this.collection.doc(task.id);
    await docRef.set(this.mapToFirestore(task));
    return task;
  }

  async update(task: Tarefa): Promise<Tarefa> {
    task.updateTimestamp();
    await this.collection.doc(task.id).update(this.mapToFirestore(task));
    return task;
  }

  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }

  private mapToEntity(id: string, data: FirebaseFirestore.DocumentData): Tarefa {
    const task = new Tarefa(
      data.userId,
      data.priorityId,
      data.title,
      data.classification,
      data.status || TaskStatus.OPEN,
      data.origin || TaskOrigin.MANUAL,
      data.description,
      data.idealDate ? data.idealDate.toDate() : undefined,
      data.responsible,
      data.meetingReference,
      id,
    );

    if (data.createdAt) {
      task.createdAt = data.createdAt.toDate();
    }
    if (data.updatedAt) {
      task.updatedAt = data.updatedAt.toDate();
    }

    return task;
  }

  private mapToFirestore(task: Tarefa): any {
    const data: any = {
      userId: task.userId,
      priorityId: task.priorityId,
      title: task.title,
      classification: task.classification,
      status: task.status,
      origin: task.origin,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };

    if (task.description !== undefined) {
      data.description = task.description;
    }
    if (task.idealDate !== undefined) {
      data.idealDate = task.idealDate;
    }
    if (task.responsible !== undefined) {
      data.responsible = task.responsible;
    }
    if (task.meetingReference !== undefined) {
      data.meetingReference = task.meetingReference;
    }

    return data;
  }
}

