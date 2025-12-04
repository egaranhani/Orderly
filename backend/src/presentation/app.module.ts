import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AiModule } from './ai/ai.module';
import { PriorityControllerModule } from './priority/priority.module';
import { TaskControllerModule } from './task/task.module';
import { InboxControllerModule } from './inbox/inbox.module';
import { ReportControllerModule } from './report/report.module';
import { FirestoreModule } from '@infrastructure/persistence/firestore/firestore.module';
import { PriorityModule } from '@application/use-cases/priority/priority.module';
import { TaskModule } from '@application/use-cases/task/task.module';
import { InboxModule } from '@application/use-cases/inbox/inbox.module';
import { ReportModule } from '@application/use-cases/report/report.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    FirestoreModule,
    AuthModule,
    AiModule,
    PriorityModule,
    TaskModule,
    InboxModule,
    ReportModule,
    PriorityControllerModule,
    TaskControllerModule,
    InboxControllerModule,
    ReportControllerModule,
  ],
})
export class AppModule {}

