import { Tarefa, TaskClassification, TaskStatus } from '../entities/task.entity';

export interface ITaskRepository {
  findById(id: string): Promise<Tarefa | null>;
  findByPriorityId(
    priorityId: string,
    filters?: {
      classification?: TaskClassification;
      status?: TaskStatus;
    },
  ): Promise<Tarefa[]>;
  findByUserId(userId: string, filters?: { status?: TaskStatus }): Promise<Tarefa[]>;
  create(task: Tarefa): Promise<Tarefa>;
  update(task: Tarefa): Promise<Tarefa>;
  delete(id: string): Promise<void>;
}

