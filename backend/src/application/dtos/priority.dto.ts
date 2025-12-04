import {
  EisenhowerQuadrant,
  PriorityStatus,
  PriorityOrigin,
} from '@domain/entities/priority.entity';

export class CreatePriorityDto {
  title: string;
  description?: string;
  quadrant: EisenhowerQuadrant;
  tags?: string[];
  origin?: PriorityOrigin;
}

export class UpdatePriorityDto {
  title?: string;
  description?: string;
  quadrant?: EisenhowerQuadrant;
  tags?: string[];
  status?: PriorityStatus;
}

export class MovePriorityDto {
  quadrant: EisenhowerQuadrant;
  displayOrder?: number;
}

export class ReorderPrioritiesDto {
  priorityIds: string[];
}

export class PriorityResponseDto {
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
  createdAt: Date;
  updatedAt: Date;
}

