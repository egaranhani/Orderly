import axios, { AxiosInstance } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const createApiClient = (token: string | null): AxiosInstance => {
  const client = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (token) {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Interceptor para log de requisições (apenas em desenvolvimento)
  if (import.meta.env.DEV) {
    client.interceptors.request.use(
      (config) => {
        console.log('📤 Requisição:', config.method?.toUpperCase(), config.url);
        console.log('🔑 Token presente:', !!config.headers.Authorization);
        return config;
      },
      (error) => {
        console.error('❌ Erro na requisição:', error);
        return Promise.reject(error);
      }
    );

    client.interceptors.response.use(
      (response) => {
        console.log('✅ Resposta:', response.status, response.config.url);
        return response;
      },
      (error) => {
        console.error('❌ Erro na resposta:', error.response?.status, error.config?.url);
        if (error.response?.status === 401) {
          console.error('🔒 Token inválido ou expirado. Limpando localStorage...');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        return Promise.reject(error);
      }
    );
  }

  return client;
};
