import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { ChatUseCase } from '@application/use-cases/ai/chat.use-case';
import { FirestoreModule } from '@infrastructure/persistence/firestore/firestore.module';
import { AiInfrastructureModule } from '@infrastructure/ai/ai.module';
import { CreateConversationUseCase } from '@application/use-cases/conversation/create-conversation.use-case';
import { GetConversationsUseCase } from '@application/use-cases/conversation/get-conversations.use-case';

@Module({
  imports: [FirestoreModule, AiInfrastructureModule],
  controllers: [AiController],
  providers: [
    ChatUseCase,
    CreateConversationUseCase,
    GetConversationsUseCase,
  ],
})
export class AiModule {}

