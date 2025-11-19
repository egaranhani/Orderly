import { Module, Global } from '@nestjs/common';
import { Firestore } from '@google-cloud/firestore';
import { FirestoreUserRepository } from './user.repository';
import { FirestoreConversationRepository } from './conversation.repository';
import { FirestorePriorityRepository } from './priority.repository';
import { FirestoreTaskRepository } from './task.repository';
import { FirestoreInboxRepository } from './inbox.repository';
import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { IConversationRepository } from '@domain/repositories/conversation.repository.interface';
import { IPriorityRepository } from '@domain/repositories/priority.repository.interface';
import { ITaskRepository } from '@domain/repositories/task.repository.interface';
import { IInboxRepository } from '@domain/repositories/inbox.repository.interface';

@Global()
@Module({
  providers: [
    {
      provide: Firestore,
      useFactory: () => {
        return new Firestore({
          projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
        });
      },
    },
    {
      provide: 'IUserRepository',
      useClass: FirestoreUserRepository,
    },
    {
      provide: 'IConversationRepository',
      useClass: FirestoreConversationRepository,
    },
    {
      provide: 'IPriorityRepository',
      useClass: FirestorePriorityRepository,
    },
    {
      provide: 'ITaskRepository',
      useClass: FirestoreTaskRepository,
    },
    {
      provide: 'IInboxRepository',
      useClass: FirestoreInboxRepository,
    },
  ],
  exports: [
    'IUserRepository',
    'IConversationRepository',
    'IPriorityRepository',
    'ITaskRepository',
    'IInboxRepository',
  ],
})
export class FirestoreModule {}

