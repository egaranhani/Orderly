export interface DailyReportDto {
  date: string;
  prioritiesByQuadrant: {
    Q1: number;
    Q2: number;
    Q3: number;
    Q4: number;
  };
  openTasks: number;
  completedTasksToday: number;
}

export interface WeeklyReportDto {
  weekStart: string;
  weekEnd: string;
  completedTasksByClassification: {
    do: number;
    schedule: number;
    delegate: number;
    eliminate: number;
  };
  actionsByOrigin: {
    manual: number;
    ai: number;
  };
}
