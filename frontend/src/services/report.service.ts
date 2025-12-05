import { createApiClient } from './api';
import { DailyReportDto, WeeklyReportDto } from '@/types/report.types';

export const reportService = {
  getDaily: async (token: string | null, date?: string) => {
    const client = createApiClient(token);
    const params = date ? { date } : {};
    const response = await client.get<DailyReportDto>('/reports/daily', {
      params,
    });
    return response.data;
  },

  getWeekly: async (token: string | null, weekStart?: string) => {
    const client = createApiClient(token);
    const params = weekStart ? { weekStart } : {};
    const response = await client.get<WeeklyReportDto>('/reports/weekly', {
      params,
    });
    return response.data;
  },
};
