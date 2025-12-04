import { Module } from '@nestjs/common';
import { FirestoreModule } from '@infrastructure/persistence/firestore/firestore.module';
import { GetDailyReportUseCase } from './get-daily-report.use-case';
import { GetWeeklyReportUseCase } from './get-weekly-report.use-case';

@Module({
  imports: [FirestoreModule],
  providers: [GetDailyReportUseCase, GetWeeklyReportUseCase],
  exports: [GetDailyReportUseCase, GetWeeklyReportUseCase],
})
export class ReportModule {}

