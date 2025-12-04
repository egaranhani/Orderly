import { Injectable, Inject } from '@nestjs/common';
import { IPriorityRepository } from '@domain/repositories/priority.repository.interface';
import { ITaskRepository } from '@domain/repositories/task.repository.interface';
import { PriorityStatus, EisenhowerQuadrant } from '@domain/entities/priority.entity';
import { TaskStatus } from '@domain/entities/task.entity';
import { DailyReportDto } from '@application/dtos/report.dto';

@Injectable()
export class GetDailyReportUseCase {
  constructor(
    @Inject('IPriorityRepository')
    private readonly priorityRepository: IPriorityRepository,
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(userId: string, date?: Date): Promise<DailyReportDto> {
    const targetDate = date || new Date();
    const dateStr = targetDate.toISOString().split('T')[0];

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const priorities = await this.priorityRepository.findByUserId(userId, {
      status: PriorityStatus.ACTIVE,
    });

    const prioritiesByQuadrant = {
      Q1: priorities.filter((p) => p.quadrant === EisenhowerQuadrant.Q1).length,
      Q2: priorities.filter((p) => p.quadrant === EisenhowerQuadrant.Q2).length,
      Q3: priorities.filter((p) => p.quadrant === EisenhowerQuadrant.Q3).length,
      Q4: priorities.filter((p) => p.quadrant === EisenhowerQuadrant.Q4).length,
    };

    const allTasks = await this.taskRepository.findByUserId(userId);
    const openTasks = allTasks.filter(
      (t) => t.status === TaskStatus.OPEN || t.status === TaskStatus.IN_PROGRESS,
    ).length;

    const completedTasksToday = allTasks.filter((t) => {
      if (t.status !== TaskStatus.COMPLETED) return false;
      const completedDate = t.updatedAt;
      return completedDate >= startOfDay && completedDate <= endOfDay;
    }).length;

    return {
      date: dateStr,
      prioritiesByQuadrant,
      openTasks,
      completedTasksToday,
    };
  }
}

