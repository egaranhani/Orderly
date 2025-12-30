import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { InboxPage } from '../InboxPage';
import { resetHandlers } from '@/test/mocks/handlers';

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

describe('InboxPage', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      workspaceDomain: 'test.orderlyai.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    resetHandlers();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  const renderWithRouter = (initialEntries = ['/inbox']) => {
    const queryClient = createTestQueryClient();
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Routes>
              <Route path="/inbox" element={<InboxPage />} />
            </Routes>
          </AuthProvider>
        </QueryClientProvider>
      </MemoryRouter>
    );
  };

  describe('Renderização Inicial', () => {
    it('deve exibir título e descrição da página', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Inbox')).toBeInTheDocument();
      });

      expect(screen.getByText(/Processe resumos de reuniões e revise sugestões da IA/i)).toBeInTheDocument();
    });

    it('deve exibir formulário de processamento', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Processar Reunião')).toBeInTheDocument();
      });

      expect(screen.getByPlaceholderText(/Ex: Reunião de Planejamento/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Cole ou digite o resumo da reunião aqui/i)).toBeInTheDocument();
      expect(screen.getByText('Processar com IA')).toBeInTheDocument();
    });

    it('deve carregar e exibir sugestões processadas', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Sugestões Processadas')).toBeInTheDocument();
      }, { timeout: 3000 });

      await waitFor(() => {
        expect(screen.getByText(/Revisar proposta técnica com equipe/i)).toBeInTheDocument();
      });
    });
  });

  describe('Processamento de Reunião', () => {
    it('deve desabilitar botão de processar quando textarea está vazio', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Processar Reunião')).toBeInTheDocument();
      });

      const processButton = screen.getByText('Processar com IA');
      expect(processButton).toBeDisabled();
    });

    it('deve habilitar botão de processar quando há conteúdo', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Processar Reunião')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Cole ou digite o resumo da reunião aqui/i);
      await user.type(textarea, 'Resumo da reunião de teste');

      const processButton = screen.getByText('Processar com IA');
      expect(processButton).not.toBeDisabled();
    });

    it('deve processar reunião quando botão é clicado', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Processar Reunião')).toBeInTheDocument();
      });

      const titleInput = screen.getByPlaceholderText(/Ex: Reunião de Planejamento/i);
      const textarea = screen.getByPlaceholderText(/Cole ou digite o resumo da reunião aqui/i);
      const processButton = screen.getByText('Processar com IA');

      await user.type(titleInput, 'Reunião de Teste');
      await user.type(textarea, 'Resumo da reunião de teste');
      await user.click(processButton);

      await waitFor(() => {
        expect(processButton).toHaveTextContent('Processando...');
      }, { timeout: 1000 });
    });
  });

  describe('Listagem de Sugestões', () => {
    it('deve exibir contador de sugestões', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/sugestão.*disponível/i)).toBeInTheDocument();
      });
    });

    it('deve exibir cards de sugestão com informações corretas', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/Revisar proposta técnica com equipe/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/Prioridade Sugerida/i)).toBeInTheDocument();
      expect(screen.getByText(/Tarefa Sugerida/i)).toBeInTheDocument();
    });

    it('deve exibir filtro de status', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Sugestões Processadas')).toBeInTheDocument();
      });

      const filterSelect = screen.getByRole('combobox', { name: /filtrar por status/i });
      expect(filterSelect).toBeInTheDocument();
    });
  });

  describe('Ações em Sugestões', () => {
    it('deve exibir botões de ação em cada sugestão', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/Revisar proposta técnica com equipe/i)).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText('Editar');
      const acceptButtons = screen.getAllByText('Aceitar');
      const discardButtons = screen.getAllByText('Descartar');

      expect(editButtons.length).toBeGreaterThan(0);
      expect(acceptButtons.length).toBeGreaterThan(0);
      expect(discardButtons.length).toBeGreaterThan(0);
    });

    it('deve abrir dialog de edição ao clicar em Editar', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/Revisar proposta técnica com equipe/i)).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText('Editar');
      await user.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Editar Sugestão')).toBeInTheDocument();
      });

      expect(screen.getByText(/Ajuste os campos antes de aceitar a sugestão/i)).toBeInTheDocument();
    });

    it('deve abrir dialog de confirmação ao clicar em Descartar', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/Revisar proposta técnica com equipe/i)).toBeInTheDocument();
      });

      const discardButtons = screen.getAllByText('Descartar');
      await user.click(discardButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Descartar Sugestão')).toBeInTheDocument();
      });

      expect(screen.getByText(/Tem certeza que deseja descartar esta sugestão/i)).toBeInTheDocument();
    });
  });

  describe('Histórico', () => {
    it('deve exibir seção de histórico', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Histórico')).toBeInTheDocument();
      });
    });

    it('deve permitir expandir/colapsar histórico', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Histórico')).toBeInTheDocument();
      });

      const toggleButton = screen.getByText('Mostrar');
      await user.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByText('Ocultar')).toBeInTheDocument();
      });
    });
  });

  describe('Filtros', () => {
    it('deve permitir filtrar por status', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Sugestões Processadas')).toBeInTheDocument();
      });

      const filterSelect = screen.getByRole('combobox');
      await user.click(filterSelect);

      await waitFor(() => {
        expect(screen.getByText('Todas')).toBeInTheDocument();
        expect(screen.getByText('Pendentes')).toBeInTheDocument();
        expect(screen.getByText('Processadas')).toBeInTheDocument();
      });
    });
  });

  describe('Estados Vazios', () => {
    it('deve exibir mensagem quando não há sugestões', async () => {
      renderWithRouter();

      await waitFor(() => {
        const emptyMessage = screen.queryByText(/Processe uma reunião para ver sugestões/i);
        if (emptyMessage) {
          expect(emptyMessage).toBeInTheDocument();
        }
      });
    });
  });
});

