import { Module } from '@nestjs/common';
import { FirestoreModule } from '@infrastructure/persistence/firestore/firestore.module';
import { AiInfrastructureModule } from '@infrastructure/ai/ai.module';
import { ProcessInboxUseCase } from './process-inbox.use-case';
import { GetInboxItemsUseCase } from './get-inbox-items.use-case';
import { GetInboxItemUseCase } from './get-inbox-item.use-case';
import { AcceptSuggestionUseCase } from './accept-suggestion.use-case';
import { DiscardSuggestionUseCase } from './discard-suggestion.use-case';
import { DeleteInboxItemUseCase } from './delete-inbox-item.use-case';

@Module({
  imports: [FirestoreModule, AiInfrastructureModule],
  providers: [
    ProcessInboxUseCase,
    GetInboxItemsUseCase,
    GetInboxItemUseCase,
    AcceptSuggestionUseCase,
    DiscardSuggestionUseCase,
    DeleteInboxItemUseCase,
  ],
  exports: [
    ProcessInboxUseCase,
    GetInboxItemsUseCase,
    GetInboxItemUseCase,
    AcceptSuggestionUseCase,
    DiscardSuggestionUseCase,
    DeleteInboxItemUseCase,
  ],
})
export class InboxModule {}

