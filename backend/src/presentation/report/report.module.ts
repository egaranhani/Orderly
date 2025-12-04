import { Module } from '@nestjs/common';
import { ReportModule as ReportUseCaseModule } from '@application/use-cases/report/report.module';
import { ReportController } from './report.controller';

@Module({
  imports: [ReportUseCaseModule],
  controllers: [ReportController],
})
export class ReportControllerModule {}

