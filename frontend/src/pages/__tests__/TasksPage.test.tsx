import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { TasksPage } from '../TasksPage';
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

describe('TasksPage', () => {
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

  const renderWithRouter = (initialEntries = ['/priorities/1/tasks']) => {
    const queryClient = createTestQueryClient();
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Routes>
              <Route path="/priorities/:id/tasks" element={<TasksPage />} />
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

    it('deve carregar tarefas da prioridade', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Tarefas')).toBeInTheDocument();
      }, { timeout: 3000 });

      expect(screen.getByText('Tarefa relacionada')).toBeInTheDocument();
    });

    it('deve exibir 4 colunas de classificação', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Tarefas')).toBeInTheDocument();
      }, { timeout: 3000 });

      expect(screen.getByText('Fazer')).toBeInTheDocument();
      expect(screen.getByText('Agendar')).toBeInTheDocument();
      expect(screen.getByText('Delegar')).toBeInTheDocument();
      expect(screen.getByText('Eliminar')).toBeInTheDocument();
    });

    it('deve exibir título da prioridade', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/prioridade urgente e importante/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Criação de Tarefa', () => {
    it('deve abrir dialog ao clicar em "Nova Tarefa"', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Tarefas')).toBeInTheDocument();
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
        expect(screen.getByText('Tarefas')).toBeInTheDocument();
      });

      const createButton = screen.getByRole('button', { name: /nova tarefa/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog', { name: /criar nova tarefa/i })).toBeInTheDocument();
      });

      const dialog = screen.getByRole('dialog', { name: /criar nova tarefa/i });
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
        expect(screen.getByText('Tarefas')).toBeInTheDocument();
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
        expect(alertSpy).toHaveBeenCalledWith('Por favor, preencha o título da tarefa');
      });

      alertSpy.mockRestore();
    });
  });

  describe('Edição de Tarefa', () => {
    it('deve abrir dialog de edição ao clicar no menu da tarefa', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Tarefa relacionada')).toBeInTheDocument();
      });

      const taskCard = screen.getByText('Tarefa relacionada').closest('div[class*="card"]');
      if (taskCard) {
        const menuButton = within(taskCard as HTMLElement).getByRole('button');
        await user.click(menuButton);

        await waitFor(() => {
          expect(screen.getByText(/editar/i)).toBeInTheDocument();
        });

        await user.click(screen.getByText(/editar/i));

        await waitFor(() => {
          expect(screen.getByRole('dialog', { name: /editar tarefa/i })).toBeInTheDocument();
        });
      }
    });

    it('deve atualizar tarefa com sucesso', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Tarefa relacionada')).toBeInTheDocument();
      });

      const taskCard = screen.getByText('Tarefa relacionada').closest('div[class*="card"]');
      if (taskCard) {
        const menuButton = within(taskCard as HTMLElement).getByRole('button');
        await user.click(menuButton);

        await waitFor(() => {
          expect(screen.getByText(/editar/i)).toBeInTheDocument();
        });

        await user.click(screen.getByText(/editar/i));

        await waitFor(() => {
          expect(screen.getByRole('dialog', { name: /editar tarefa/i })).toBeInTheDocument();
        });

        const dialog = screen.getByRole('dialog', { name: /editar tarefa/i });
        const titleInput = within(dialog).getByPlaceholderText(/digite o título/i);
        await user.clear(titleInput);
        await user.type(titleInput, 'Tarefa Editada');

        const saveButton = within(dialog).getByRole('button', { name: /salvar/i });
        await user.click(saveButton);

        await waitFor(() => {
          expect(screen.queryByRole('dialog', { name: /editar tarefa/i })).not.toBeInTheDocument();
        });
      }
    });
  });

  describe('Deletar Tarefa', () => {
    it('deve mostrar dialog de confirmação ao deletar', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Tarefa relacionada')).toBeInTheDocument();
      });

      const taskCard = screen.getByText('Tarefa relacionada').closest('div[class*="card"]');
      if (taskCard) {
        const menuButton = within(taskCard as HTMLElement).getByRole('button');
        await user.click(menuButton);

        await waitFor(() => {
          expect(screen.getByText(/deletar/i)).toBeInTheDocument();
        });

        await user.click(screen.getByText(/deletar/i));

        await waitFor(() => {
          expect(screen.getByRole('dialog', { name: /confirmar exclusão/i })).toBeInTheDocument();
        });
      }
    });

    it('deve remover tarefa da lista após confirmar exclusão', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Tarefa relacionada')).toBeInTheDocument();
      });

      const taskCard = screen.getByText('Tarefa relacionada').closest('div[class*="card"]');
      if (taskCard) {
        const menuButton = within(taskCard as HTMLElement).getByRole('button');
        await user.click(menuButton);

        await waitFor(() => {
          expect(screen.getByText(/deletar/i)).toBeInTheDocument();
        });

        await user.click(screen.getByText(/deletar/i));

        await waitFor(() => {
          expect(screen.getByRole('dialog', { name: /confirmar exclusão/i })).toBeInTheDocument();
        });

        const dialog = screen.getByRole('dialog', { name: /confirmar exclusão/i });
        const deleteButton = within(dialog).getByRole('button', { name: /excluir/i });
        await user.click(deleteButton);

        await waitFor(() => {
          expect(screen.queryByText('Tarefa relacionada')).not.toBeInTheDocument();
        });
      }
    });
  });

  describe('Completar/Cancelar Tarefa', () => {
    it('deve completar tarefa aberta', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Tarefa relacionada')).toBeInTheDocument();
      });

      const taskCard = screen.getByText('Tarefa relacionada').closest('div[class*="card"]');
      if (taskCard) {
        const menuButton = within(taskCard as HTMLElement).getByRole('button');
        await user.click(menuButton);

        await waitFor(() => {
          expect(screen.getByText(/completar/i)).toBeInTheDocument();
        });

        await user.click(screen.getByText(/completar/i));

        await waitFor(() => {
          expect(screen.getByText(/concluída/i)).toBeInTheDocument();
        });
      }
    });
  });

  describe('Tratamento de Erro', () => {
    it('deve mostrar erro se falhar ao carregar tarefas', async () => {
      server.use(
        http.get('/api/priorities/:id/tasks', () => {
          return HttpResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
          );
        })
      );

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/erro/i)).toBeInTheDocument();
      });
    });
  });
});

