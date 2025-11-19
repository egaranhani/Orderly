import axios from 'axios';
import { Conversation, CreateConversationDto, ChatRequestDto } from '../types/conversation.types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const aiService = {
  createConversation: async (dto: CreateConversationDto): Promise<Conversation> => {
    const response = await axios.post(
      `${API_URL}/ai/conversations`,
      dto,
      getAuthHeaders(),
    );
    return response.data;
  },

  getConversations: async (): Promise<Conversation[]> => {
    const response = await axios.get(
      `${API_URL}/ai/conversations`,
      getAuthHeaders(),
    );
    return response.data;
  },

  sendMessage: async (dto: ChatRequestDto) => {
    const response = await axios.post(
      `${API_URL}/ai/chat`,
      dto,
      getAuthHeaders(),
    );
    return response.data;
  },
};

