import {
  TaskClassification,
} from '@domain/entities/task.entity';
import {
  PriorityOrigin,
} from '@domain/entities/priority.entity';
import {
  TaskOrigin,
} from '@domain/entities/task.entity';

export class DailyReportDto {
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

export class WeeklyReportDto {
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

