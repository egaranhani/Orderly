import { BaseEntity } from './base.entity';

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

export class Tarefa extends BaseEntity {
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

  constructor(
    userId: string,
    priorityId: string,
    title: string,
    classification: TaskClassification,
    status: TaskStatus = TaskStatus.OPEN,
    origin: TaskOrigin = TaskOrigin.MANUAL,
    description?: string,
    idealDate?: Date,
    responsible?: string,
    meetingReference?: string,
    id?: string,
  ) {
    super(id);
    this.userId = userId;
    this.priorityId = priorityId;
    this.title = title;
    this.description = description;
    this.classification = classification;
    this.idealDate = idealDate;
    this.responsible = responsible;
    this.status = status;
    this.origin = origin;
    this.meetingReference = meetingReference;
  }
}

