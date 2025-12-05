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

export interface CreatePriorityDto {
  title: string;
  description?: string;
  quadrant: EisenhowerQuadrant;
  tags?: string[];
  origin?: PriorityOrigin;
}

export interface UpdatePriorityDto {
  title?: string;
  description?: string;
  quadrant?: EisenhowerQuadrant;
  tags?: string[];
  status?: PriorityStatus;
}

export interface MovePriorityDto {
  quadrant: EisenhowerQuadrant;
  displayOrder?: number;
}

export interface ReorderPrioritiesDto {
  priorityIds: string[];
}

export interface PriorityResponseDto {
  id: string;
  userId: string;
  title: string;
  description?: string;
  quadrant: EisenhowerQuadrant;
  tags: string[];
  status: PriorityStatus;
  origin: PriorityOrigin;
  displayOrder: number;
  taskCount?: number;
  createdAt: string;
  updatedAt: string;
}
