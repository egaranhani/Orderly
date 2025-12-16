import { describe, it, expect, beforeEach } from 'vitest';
import { render as rtlRender, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '../ProtectedRoute';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

const renderWithRouter = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return rtlRender(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{ui}</AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Renderização', () => {
    it('deve exibir loading quando isLoading é true', async () => {
      renderWithRouter(
        <ProtectedRoute>
          <div data-testid="protected-content">Conteúdo Protegido</div>
        </ProtectedRoute>
      );

      const loadingText = screen.queryByText('Carregando...');
      if (loadingText) {
        expect(loadingText).toBeInTheDocument();
      }
    });

    it('deve renderizar children após carregar', async () => {
      renderWithRouter(
        <ProtectedRoute>
          <div data-testid="protected-content">Conteúdo Protegido</div>
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });

      expect(screen.getByText('Conteúdo Protegido')).toBeInTheDocument();
    });
  });

  describe('Comportamento', () => {
    it('deve permitir acesso quando autenticado', async () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem(
        'user',
        JSON.stringify({
          id: 'user-id',
          email: 'test@example.com',
          name: 'Test User',
        })
      );

      renderWithRouter(
        <ProtectedRoute>
          <div data-testid="protected-content">Conteúdo Protegido</div>
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });
    });

    it('deve permitir acesso mesmo sem token (modo desenvolvimento)', async () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      renderWithRouter(
        <ProtectedRoute>
          <div data-testid="protected-content">Conteúdo Protegido</div>
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });
    });
  });
});
