import {
  TaskClassification,
  TaskStatus,
  TaskOrigin,
} from '@domain/entities/task.entity';

export class CreateTaskDto {
  title: string;
  description?: string;
  classification: TaskClassification;
  idealDate?: Date;
  responsible?: string;
  origin?: TaskOrigin;
  meetingReference?: string;
}

export class UpdateTaskDto {
  title?: string;
  description?: string;
  classification?: TaskClassification;
  idealDate?: Date;
  responsible?: string;
  status?: TaskStatus;
}

export class MoveTaskDto {
  classification: TaskClassification;
  idealDate?: Date;
  responsible?: string;
}

export class TaskResponseDto {
  id: string;
  userId: string;
  priorityId: string;
  title: string;
  description?: string;
  classification: TaskClassification;
  idealDate?: Date;
  responsible?: string;
  status: TaskStatus;
  origin: TaskOrigin;
  meetingReference?: string;
  createdAt: Date;
  updatedAt: Date;
}

