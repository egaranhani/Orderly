import { Prioridade, PriorityStatus, EisenhowerQuadrant, PriorityOrigin } from '../entities/priority.entity';

export interface IPriorityRepository {
  findById(id: string): Promise<Prioridade | null>;
  findByUserId(
    userId: string,
    filters?: {
      status?: PriorityStatus;
      quadrant?: EisenhowerQuadrant;
      tags?: string[];
      origin?: PriorityOrigin;
    },
  ): Promise<Prioridade[]>;
  create(priority: Prioridade): Promise<Prioridade>;
  update(priority: Prioridade): Promise<Prioridade>;
  delete(id: string): Promise<void>;
  findByUserIdAndQuadrant(userId: string, quadrant: EisenhowerQuadrant): Promise<Prioridade[]>;
  updateDisplayOrder(priorityId: string, displayOrder: number): Promise<void>;
}

