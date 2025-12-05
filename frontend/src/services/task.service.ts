import { createApiClient } from './api';
import {
  CreateTaskDto,
  UpdateTaskDto,
  MoveTaskDto,
  TaskResponseDto,
} from '@/types/task.types';

export const taskService = {
  getAll: async (token: string | null, priorityId?: string) => {
    const client = createApiClient(token);
    const params = priorityId ? { priorityId } : {};
    const response = await client.get<TaskResponseDto[]>('/tasks', {
      params,
    });
    return response.data;
  },

  getById: async (token: string | null, id: string) => {
    const client = createApiClient(token);
    const response = await client.get<TaskResponseDto>(`/tasks/${id}`);
    return response.data;
  },

  create: async (
    token: string | null,
    priorityId: string,
    data: CreateTaskDto
  ) => {
    const client = createApiClient(token);
    const response = await client.post<TaskResponseDto>(
      `/priorities/${priorityId}/tasks`,
      data
    );
    return response.data;
  },

  update: async (token: string | null, id: string, data: UpdateTaskDto) => {
    const client = createApiClient(token);
    const response = await client.patch<TaskResponseDto>(`/tasks/${id}`, data);
    return response.data;
  },

  move: async (token: string | null, id: string, data: MoveTaskDto) => {
    const client = createApiClient(token);
    const response = await client.post<TaskResponseDto>(
      `/tasks/${id}/move`,
      data
    );
    return response.data;
  },

  complete: async (token: string | null, id: string) => {
    const client = createApiClient(token);
    const response = await client.post<TaskResponseDto>(`/tasks/${id}/complete`);
    return response.data;
  },

  cancel: async (token: string | null, id: string) => {
    const client = createApiClient(token);
    const response = await client.post<TaskResponseDto>(`/tasks/${id}/cancel`);
    return response.data;
  },

  delete: async (token: string | null, id: string) => {
    const client = createApiClient(token);
    await client.delete(`/tasks/${id}`);
  },
};
