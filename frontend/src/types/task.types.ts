export enum TaskClassification {
  DO = 'do',
  SCHEDULE = 'schedule',
  DELEGATE = 'delegate',
  ELIMINATE = 'eliminate',
}

export enum TaskStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TaskOrigin {
  MANUAL = 'manual',
  AI = 'ai',
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  classification: TaskClassification;
  idealDate?: string;
  responsible?: string;
  origin?: TaskOrigin;
  meetingReference?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  classification?: TaskClassification;
  idealDate?: string;
  responsible?: string;
  status?: TaskStatus;
}

export interface MoveTaskDto {
  classification: TaskClassification;
  idealDate?: string;
  responsible?: string;
}

export interface TaskResponseDto {
  id: string;
  userId: string;
  priorityId: string;
  title: string;
  description?: string;
  classification: TaskClassification;
  idealDate?: string;
  responsible?: string;
  status: TaskStatus;
  origin: TaskOrigin;
  meetingReference?: string;
  createdAt: string;
  updatedAt: string;
}
