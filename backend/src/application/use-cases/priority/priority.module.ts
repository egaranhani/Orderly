import { Module } from '@nestjs/common';
import { FirestoreModule } from '@infrastructure/persistence/firestore/firestore.module';
import { CreatePriorityUseCase } from './create-priority.use-case';
import { GetPrioritiesUseCase } from './get-priorities.use-case';
import { GetPriorityUseCase } from './get-priority.use-case';
import { UpdatePriorityUseCase } from './update-priority.use-case';
import { MovePriorityUseCase } from './move-priority.use-case';
import { ReorderPrioritiesUseCase } from './reorder-priorities.use-case';
import { ArchivePriorityUseCase } from './archive-priority.use-case';
import { DeletePriorityUseCase } from './delete-priority.use-case';

@Module({
  imports: [FirestoreModule],
  providers: [
    CreatePriorityUseCase,
    GetPrioritiesUseCase,
    GetPriorityUseCase,
    UpdatePriorityUseCase,
    MovePriorityUseCase,
    ReorderPrioritiesUseCase,
    ArchivePriorityUseCase,
    DeletePriorityUseCase,
  ],
  exports: [
    CreatePriorityUseCase,
    GetPrioritiesUseCase,
    GetPriorityUseCase,
    UpdatePriorityUseCase,
    MovePriorityUseCase,
    ReorderPrioritiesUseCase,
    ArchivePriorityUseCase,
    DeletePriorityUseCase,
  ],
})
export class PriorityModule {}

