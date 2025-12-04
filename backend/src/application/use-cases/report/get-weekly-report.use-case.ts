import { Injectable, Inject } from '@nestjs/common';
import { ITaskRepository } from '@domain/repositories/task.repository.interface';
import { TaskStatus, TaskClassification, TaskOrigin } from '@domain/entities/task.entity';
import { WeeklyReportDto } from '@application/dtos/report.dto';

@Injectable()
export class GetWeeklyReportUseCase {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(userId: string, weekStart?: string): Promise<WeeklyReportDto> {
    let startDate: Date;
    if (weekStart) {
      startDate = new Date(weekStart);
    } else {
      startDate = this.getStartOfWeek(new Date());
    }

    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    const allTasks = await this.taskRepository.findByUserId(userId);

    const completedTasksInWeek = allTasks.filter((t) => {
      if (t.status !== TaskStatus.COMPLETED) return false;
      const completedDate = t.updatedAt;
      return completedDate >= startDate && completedDate <= endDate;
    });

    const completedTasksByClassification = {
      do: completedTasksInWeek.filter((t) => t.classification === TaskClassification.DO).length,
      schedule: completedTasksInWeek.filter((t) => t.classification === TaskClassification.SCHEDULE).length,
      delegate: completedTasksInWeek.filter((t) => t.classification === TaskClassification.DELEGATE).length,
      eliminate: completedTasksInWeek.filter((t) => t.classification === TaskClassification.ELIMINATE).length,
    };

    const allCompletedTasks = allTasks.filter((t) => t.status === TaskStatus.COMPLETED);
    const actionsByOrigin = {
      manual: allCompletedTasks.filter((t) => t.origin === TaskOrigin.MANUAL).length,
      ai: allCompletedTasks.filter((t) => t.origin === TaskOrigin.AI).length,
    };

    return {
      weekStart: startDate.toISOString().split('T')[0],
      weekEnd: endDate.toISOString().split('T')[0],
      completedTasksByClassification,
      actionsByOrigin,
    };
  }

  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }
}

