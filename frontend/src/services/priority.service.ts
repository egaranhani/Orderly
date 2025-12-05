import { createApiClient } from './api';
import {
  CreatePriorityDto,
  UpdatePriorityDto,
  MovePriorityDto,
  ReorderPrioritiesDto,
  PriorityResponseDto,
  EisenhowerQuadrant,
} from '@/types/priority.types';

export const priorityService = {
  getAll: async (token: string | null, quadrant?: EisenhowerQuadrant) => {
    const client = createApiClient(token);
    const params = quadrant ? { quadrant } : {};
    const response = await client.get<{ priorities: PriorityResponseDto[] }>('/priorities', {
      params,
    });
    return response.data.priorities;
  },

  getById: async (token: string | null, id: string) => {
    const client = createApiClient(token);
    const response = await client.get<PriorityResponseDto>(
      `/priorities/${id}`
    );
    return response.data;
  },

  create: async (token: string | null, data: CreatePriorityDto) => {
    const client = createApiClient(token);
    const response = await client.post<PriorityResponseDto>(
      '/priorities',
      data
    );
    return response.data;
  },

  update: async (
    token: string | null,
    id: string,
    data: UpdatePriorityDto
  ) => {
    const client = createApiClient(token);
    const response = await client.patch<PriorityResponseDto>(
      `/priorities/${id}`,
      data
    );
    return response.data;
  },

  move: async (token: string | null, id: string, data: MovePriorityDto) => {
    const client = createApiClient(token);
    const response = await client.post<PriorityResponseDto>(
      `/priorities/${id}/move`,
      data
    );
    return response.data;
  },

  reorder: async (
    token: string | null,
    quadrant: EisenhowerQuadrant,
    data: ReorderPrioritiesDto
  ) => {
    const client = createApiClient(token);
    const response = await client.post<{ success: boolean }>(
      `/priorities/${quadrant}/reorder`,
      data
    );
    return response.data;
  },

  archive: async (token: string | null, id: string) => {
    const client = createApiClient(token);
    const response = await client.post<PriorityResponseDto>(
      `/priorities/${id}/archive`
    );
    return response.data;
  },

  delete: async (token: string | null, id: string) => {
    const client = createApiClient(token);
    await client.delete(`/priorities/${id}`);
  },

  getTasks: async (token: string | null, priorityId: string) => {
    const client = createApiClient(token);
    const response = await client.get<{ tasks: any[] }>(`/priorities/${priorityId}/tasks`);
    return response.data.tasks;
  },
};
