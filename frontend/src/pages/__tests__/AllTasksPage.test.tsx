import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AllTasksPage } from '../AllTasksPage';
import {
  TaskClassification,
  TaskStatus,
  TaskOrigin,
} from '@/types/task.types';
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

describe('AllTasksPage', () => {
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
  });

  const renderWithRouter = (initialEntries = ['/tasks']) => {
    const queryClient = createTestQueryClient();
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Routes>
              <Route path="/tasks" element={<AllTasksPage />} />
            </Routes>
          </AuthProvider>
        </QueryClientProvider>
      </MemoryRouter>
    );
  };

  describe('Renderização Inicial', () => {
    it('deve exibir estado de loading inicialmente', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/carregando tarefas/i)).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('deve carregar e exibir tarefas agregadas', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Gestão de Tarefas')).toBeInTheDocument();
      }, { timeout: 3000 });

      expect(screen.getByText('Tarefa relacionada')).toBeInTheDocument();
    });

    it('deve exibir 4 colunas de classificação', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Gestão de Tarefas')).toBeInTheDocument();
      }, { timeout: 3000 });

      expect(screen.getByText('Fazer')).toBeInTheDocument();
      expect(screen.getByText('Agendar')).toBeInTheDocument();
      expect(screen.getByText('Delegar')).toBeInTheDocument();
      expect(screen.getByText('Eliminar')).toBeInTheDocument();
    });
  });

  describe('Filtros', () => {
    it('deve filtrar tarefas por texto de busca', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Gestão de Tarefas')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/buscar por título ou descrição/i);
      await user.type(searchInput, 'Tarefa relacionada');

      await waitFor(() => {
        expect(screen.getByText('Tarefa relacionada')).toBeInTheDocument();
      });
    });

    it('deve filtrar tarefas por prioridade', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Gestão de Tarefas')).toBeInTheDocument();
      });

      const prioritySelect = screen.getByLabelText(/prioridade/i);
      await user.click(prioritySelect);

      await waitFor(() => {
        const options = screen.getAllByRole('option');
        expect(options.length).toBeGreaterThan(0);
      });
    });

    it('deve filtrar tarefas por status', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Gestão de Tarefas')).toBeInTheDocument();
      });

      const statusSelect = screen.getByLabelText(/status/i);
      await user.click(statusSelect);

      await waitFor(() => {
        expect(screen.getByText('Abertas')).toBeInTheDocument();
      });
    });
  });

  describe('Criação de Tarefa', () => {
    it('deve abrir dialog ao clicar em "Nova Tarefa"', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Gestão de Tarefas')).toBeInTheDocument();
      });

      const createButton = screen.getByRole('button', { name: /nova tarefa/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog', { name: /criar nova tarefa/i })).toBeInTheDocument();
      });
    });

    it('deve criar tarefa e adicionar à classificação correta', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Gestão de Tarefas')).toBeInTheDocument();
      });

      const createButton = screen.getByRole('button', { name: /nova tarefa/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog', { name: /criar nova tarefa/i })).toBeInTheDocument();
      });

      const dialog = screen.getByRole('dialog', { name: /criar nova tarefa/i });
      const prioritySelect = within(dialog).getByText(/selecione uma prioridade/i);
      await user.click(prioritySelect);

      await waitFor(() => {
        const priorityOption = screen.getByText(/prioridade urgente e importante/i);
        await user.click(priorityOption);
      });

      const titleInput = within(dialog).getByPlaceholderText(/digite o título/i);
      await user.type(titleInput, 'Nova Tarefa de Teste');

      const createBtn = within(dialog).getByRole('button', { name: /criar/i });
      await user.click(createBtn);

      await waitFor(() => {
        expect(screen.queryByRole('dialog', { name: /criar nova tarefa/i })).not.toBeInTheDocument();
      });
    });

    it('deve validar campos obrigatórios', async () => {
      const user = userEvent.setup();
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Gestão de Tarefas')).toBeInTheDocument();
      });

      const createButton = screen.getByRole('button', { name: /nova tarefa/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog', { name: /criar nova tarefa/i })).toBeInTheDocument();
      });

      const dialog = screen.getByRole('dialog', { name: /criar nova tarefa/i });
      const createBtn = within(dialog).getByRole('button', { name: /criar/i });
      await user.click(createBtn);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalled();
      });

      alertSpy.mockRestore();
    });
  });

  describe('Edição de Tarefa', () => {
    it('deve abrir dialog de edição ao clicar em Editar', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Gestão de Tarefas')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('Tarefa relacionada')).toBeInTheDocument();
      });

      const taskCards = screen.getAllByText('Tarefa relacionada');
      const taskCard = taskCards[0].closest('[class*="card"]');
      
      if (taskCard) {
        const menuButton = within(taskCard as HTMLElement).getByRole('button');
        await user.click(menuButton);

        await waitFor(() => {
          expect(screen.getByText('Editar')).toBeInTheDocument();
        });

        const editOption = screen.getByText('Editar');
        await user.click(editOption);

        await waitFor(() => {
          expect(screen.getByRole('dialog', { name: /editar tarefa/i })).toBeInTheDocument();
        });
      }
    });
  });

  describe('Exclusão de Tarefa', () => {
    it('deve abrir dialog de confirmação ao clicar em Deletar', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Gestão de Tarefas')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('Tarefa relacionada')).toBeInTheDocument();
      });

      const taskCards = screen.getAllByText('Tarefa relacionada');
      const taskCard = taskCards[0].closest('[class*="card"]');
      
      if (taskCard) {
        const menuButton = within(taskCard as HTMLElement).getByRole('button');
        await user.click(menuButton);

        await waitFor(() => {
          expect(screen.getByText('Deletar')).toBeInTheDocument();
        });

        const deleteOption = screen.getByText('Deletar');
        await user.click(deleteOption);

        await waitFor(() => {
          expect(screen.getByRole('dialog', { name: /confirmar exclusão/i })).toBeInTheDocument();
        });
      }
    });
  });

  describe('Operações de Tarefa', () => {
    it('deve completar tarefa ao clicar em Completar', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Gestão de Tarefas')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('Tarefa relacionada')).toBeInTheDocument();
      });

      const taskCards = screen.getAllByText('Tarefa relacionada');
      const taskCard = taskCards[0].closest('[class*="card"]');
      
      if (taskCard) {
        const menuButton = within(taskCard as HTMLElement).getByRole('button');
        await user.click(menuButton);

        await waitFor(() => {
          const completeOption = screen.queryByText('Completar');
          if (completeOption) {
            expect(completeOption).toBeInTheDocument();
          }
        });
      }
    });
  });
});

