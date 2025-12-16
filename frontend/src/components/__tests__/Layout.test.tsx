import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render as rtlRender, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Layout } from '../Layout';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';

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

const renderWithRouter = (
  ui: React.ReactElement,
  { initialEntries = ['/priorities'] }: { initialEntries?: string[] } = {}
) => {
  const queryClient = createTestQueryClient();
  localStorage.setItem('token', 'test-token');
  localStorage.setItem(
    'user',
    JSON.stringify({
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      workspaceDomain: 'test.orderlyai.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  );

  return rtlRender(
    <MemoryRouter initialEntries={initialEntries}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{ui}</AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe('Layout', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Renderização', () => {
    it('deve renderizar o layout com header e main', () => {
      renderWithRouter(
        <Layout>
          <div>Conteúdo da página</div>
        </Layout>
      );

      expect(screen.getByText('OrderlyAI')).toBeInTheDocument();
      expect(screen.getByText('Conteúdo da página')).toBeInTheDocument();
    });

    it('deve exibir o nome do usuário quando autenticado', async () => {
      renderWithRouter(
        <Layout>
          <div>Conteúdo</div>
        </Layout>
      );

      await screen.findByText('Test User');
    });
  });

  describe('Navegação', () => {
    it('deve renderizar todos os links de navegação', () => {
      renderWithRouter(
        <Layout>
          <div>Conteúdo</div>
        </Layout>
      );

      expect(screen.getByRole('link', { name: /prioridades/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /inbox/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /relatórios/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /chat/i })).toBeInTheDocument();
    });

    it('deve destacar o link ativo', () => {
      renderWithRouter(
        <Layout>
          <div>Conteúdo</div>
        </Layout>,
        { initialEntries: ['/priorities'] }
      );

      const activeLink = screen.getByRole('link', { name: /prioridades/i });
      expect(activeLink).toHaveClass('bg-primary', 'text-primary-foreground');
    });

    it('deve destacar link de inbox quando ativo', () => {
      renderWithRouter(
        <Layout>
          <div>Conteúdo</div>
        </Layout>,
        { initialEntries: ['/inbox'] }
      );

      const activeLink = screen.getByRole('link', { name: /inbox/i });
      expect(activeLink).toHaveClass('bg-primary', 'text-primary-foreground');
    });

    it('deve destacar link de relatórios quando ativo', () => {
      renderWithRouter(
        <Layout>
          <div>Conteúdo</div>
        </Layout>,
        { initialEntries: ['/reports'] }
      );

      const activeLink = screen.getByRole('link', { name: /relatórios/i });
      expect(activeLink).toHaveClass('bg-primary', 'text-primary-foreground');
    });

    it('deve destacar link de chat quando ativo', () => {
      renderWithRouter(
        <Layout>
          <div>Conteúdo</div>
        </Layout>,
        { initialEntries: ['/chat'] }
      );

      const activeLink = screen.getByRole('link', { name: /chat/i });
      expect(activeLink).toHaveClass('bg-primary', 'text-primary-foreground');
    });

    it('deve ter links inativos sem destaque', () => {
      renderWithRouter(
        <Layout>
          <div>Conteúdo</div>
        </Layout>,
        { initialEntries: ['/priorities'] }
      );

      const inactiveLink = screen.getByRole('link', { name: /inbox/i });
      expect(inactiveLink).not.toHaveClass('bg-primary');
      expect(inactiveLink).toHaveClass('text-muted-foreground');
    });
  });

  describe('Botão de Logout', () => {
    it('deve renderizar botão de logout', () => {
      renderWithRouter(
        <Layout>
          <div>Conteúdo</div>
        </Layout>
      );

      const logoutButton = screen.getByRole('button', { name: /sair/i });
      expect(logoutButton).toBeInTheDocument();
    });

    it('deve chamar função de logout ao clicar', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <Layout>
          <div>Conteúdo</div>
        </Layout>
      );

      const logoutButton = screen.getByRole('button', { name: /sair/i });
      await user.click(logoutButton);

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('Estrutura', () => {
    it('deve ter estrutura correta com header e main', () => {
      const { container } = renderWithRouter(
        <Layout>
          <div>Conteúdo</div>
        </Layout>
      );

      const header = container.querySelector('header');
      const main = container.querySelector('main');

      expect(header).toBeInTheDocument();
      expect(main).toBeInTheDocument();
    });

    it('deve renderizar children dentro do main', () => {
      renderWithRouter(
        <Layout>
          <div data-testid="custom-content">Conteúdo customizado</div>
        </Layout>
      );

      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    });
  });
});
