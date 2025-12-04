import { Module } from '@nestjs/common';
import { InboxModule as InboxUseCaseModule } from '@application/use-cases/inbox/inbox.module';
import { InboxController } from './inbox.controller';

@Module({
  imports: [InboxUseCaseModule],
  controllers: [InboxController],
})
export class InboxControllerModule {}

