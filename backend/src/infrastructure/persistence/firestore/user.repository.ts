import { Injectable } from '@nestjs/common';
import { Firestore } from '@google-cloud/firestore';
import { User } from '@domain/entities/user.entity';
import { IUserRepository } from '@domain/repositories/user.repository.interface';

@Injectable()
export class FirestoreUserRepository implements IUserRepository {
  private readonly collection: FirebaseFirestore.CollectionReference;

  constructor(private readonly firestore: Firestore) {
    this.collection = this.firestore.collection('users');
  }

  async findById(id: string): Promise<User | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists || !doc.data()) {
      return null;
    }
    return this.mapToEntity(doc.id, doc.data()!);
  }

  async findByEmail(email: string): Promise<User | null> {
    const snapshot = await this.collection
      .where('email', '==', email)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return this.mapToEntity(doc.id, doc.data());
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    const snapshot = await this.collection
      .where('googleId', '==', googleId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return this.mapToEntity(doc.id, doc.data());
  }

  async create(user: User): Promise<User> {
    const docRef = this.collection.doc(user.id);
    await docRef.set(this.mapToFirestore(user));
    return user;
  }

  async update(user: User): Promise<User> {
    user.updateTimestamp();
    await this.collection.doc(user.id).update(this.mapToFirestore(user));
    return user;
  }

  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }

  private mapToEntity(id: string, data: FirebaseFirestore.DocumentData): User {
    return new User(
      data.email,
      data.name,
      data.googleId,
      data.workspaceDomain,
      data.picture,
      id,
    );
  }

  private mapToFirestore(user: User): any {
    return {
      email: user.email,
      name: user.name,
      googleId: user.googleId,
      workspaceDomain: user.workspaceDomain,
      picture: user.picture,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

