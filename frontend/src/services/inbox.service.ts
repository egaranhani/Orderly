import { createApiClient } from './api';
import {
  ProcessInboxDto,
  AcceptSuggestionDto,
  DiscardSuggestionDto,
  InboxItemResponseDto,
  ActionSuggestionDto,
  InboxItemStatus,
} from '@/types/inbox.types';

export const inboxService = {
  process: async (token: string | null, data: ProcessInboxDto) => {
    const client = createApiClient(token);
    const response = await client.post<{
      inboxItemId: string;
      suggestions: ActionSuggestionDto[];
    }>('/inbox', data);
    return response.data;
  },

  getAll: async (token: string | null, status?: InboxItemStatus) => {
    const client = createApiClient(token);
    const params = status ? { status } : {};
    const response = await client.get<{ items: InboxItemResponseDto[] }>(
      '/inbox',
      { params }
    );
    return response.data.items;
  },

  getById: async (token: string | null, id: string) => {
    const client = createApiClient(token);
    const response = await client.get<InboxItemResponseDto>(`/inbox/${id}`);
    return response.data;
  },

  acceptSuggestion: async (
    token: string | null,
    id: string,
    data: AcceptSuggestionDto
  ) => {
    const client = createApiClient(token);
    const response = await client.post<InboxItemResponseDto>(
      `/inbox/${id}/accept`,
      data
    );
    return response.data;
  },

  discardSuggestion: async (
    token: string | null,
    id: string,
    data: DiscardSuggestionDto
  ) => {
    const client = createApiClient(token);
    const response = await client.post<InboxItemResponseDto>(
      `/inbox/${id}/discard`,
      data
    );
    return response.data;
  },

  delete: async (token: string | null, id: string) => {
    const client = createApiClient(token);
    await client.delete(`/inbox/${id}`);
  },
};
