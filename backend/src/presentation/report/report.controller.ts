import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetDailyReportUseCase } from '@application/use-cases/report/get-daily-report.use-case';
import { GetWeeklyReportUseCase } from '@application/use-cases/report/get-weekly-report.use-case';
import { DailyReportDto, WeeklyReportDto } from '@application/dtos/report.dto';

@Controller('reports')
@UseGuards(AuthGuard('jwt'))
export class ReportController {
  constructor(
    private readonly getDailyReportUseCase: GetDailyReportUseCase,
    private readonly getWeeklyReportUseCase: GetWeeklyReportUseCase,
  ) {}

  @Get('daily')
  async getDailyReport(
    @Request() req: any,
    @Query('date') date?: string,
  ): Promise<DailyReportDto> {
    const dateObj = date ? new Date(date) : undefined;
    return this.getDailyReportUseCase.execute(req.user.id, dateObj);
  }

  @Get('weekly')
  async getWeeklyReport(
    @Request() req: any,
    @Query('weekStart') weekStart?: string,
  ): Promise<WeeklyReportDto> {
    return this.getWeeklyReportUseCase.execute(req.user.id, weekStart);
  }
}

