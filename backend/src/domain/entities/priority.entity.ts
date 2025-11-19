import { BaseEntity } from './base.entity';

export enum EisenhowerQuadrant {
  Q1 = 'Q1',
  Q2 = 'Q2',
  Q3 = 'Q3',
  Q4 = 'Q4',
}

export enum PriorityStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

export enum PriorityOrigin {
  MANUAL = 'manual',
  AI = 'ai',
}

export class Prioridade extends BaseEntity {
  userId: string;
  title: string;
  description?: string;
  quadrant: EisenhowerQuadrant;
  tags: string[];
  status: PriorityStatus;
  origin: PriorityOrigin;
  displayOrder: number;

  constructor(
    userId: string,
    title: string,
    quadrant: EisenhowerQuadrant,
    tags: string[] = [],
    status: PriorityStatus = PriorityStatus.ACTIVE,
    origin: PriorityOrigin = PriorityOrigin.MANUAL,
    displayOrder: number = 0,
    description?: string,
    id?: string,
  ) {
    super(id);
    this.userId = userId;
    this.title = title;
    this.description = description;
    this.quadrant = quadrant;
    this.tags = tags;
    this.status = status;
    this.origin = origin;
    this.displayOrder = displayOrder;
  }
}

