import { Module, Global } from '@nestjs/common';
import { Firestore } from '@google-cloud/firestore';
import { FirestoreUserRepository } from './user.repository';
import { FirestoreConversationRepository } from './conversation.repository';
import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { IConversationRepository } from '@domain/repositories/conversation.repository.interface';

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
  ],
  exports: ['IUserRepository', 'IConversationRepository'],
})
export class FirestoreModule {}

