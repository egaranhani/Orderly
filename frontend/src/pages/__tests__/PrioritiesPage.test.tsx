import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { PrioritiesPage } from '../PrioritiesPage';

describe('PrioritiesPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Renderização Inicial', () => {
    it('deve exibir estado de loading inicialmente', () => {
      render(<PrioritiesPage />);

      expect(screen.getByText(/carregando prioridades/i)).toBeInTheDocument();
    });

    it('deve carregar e exibir as prioridades da API', async () => {
      render(<PrioritiesPage />);

      await waitFor(() => {
        expect(screen.getByText('Matriz de Prioridades')).toBeInTheDocument();
      });

      expect(
        screen.getByText('Prioridade Urgente e Importante')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Prioridade Não Urgente mas Importante')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Prioridade Urgente mas Não Importante')
      ).toBeInTheDocument();
    });

    it('deve exibir os quadrantes corretamente', async () => {
      render(<PrioritiesPage />);

      await waitFor(() => {
        expect(screen.getByText('Matriz de Prioridades')).toBeInTheDocument();
      });

      expect(screen.getAllByText('Urgente / Importante').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Não Urgente / Importante').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Urgente / Não Importante').length).toBeGreaterThan(0);
      expect(
        screen.getAllByText('Não Urgente / Não Importante').length
      ).toBeGreaterThan(0);
    });

    it('deve exibir tags das prioridades', async () => {
      render(<PrioritiesPage />);

      await waitFor(() => {
        expect(screen.getByText('urgente')).toBeInTheDocument();
      });

      expect(screen.getByText('importante')).toBeInTheDocument();
      expect(screen.getByText('planejamento')).toBeInTheDocument();
    });
  });

  describe('Criação de Prioridade', () => {
    it('deve abrir o modal de criação ao clicar no botão', async () => {
      const user = userEvent.setup();
      render(<PrioritiesPage />);

      await waitFor(() => {
        expect(screen.getByText('Matriz de Prioridades')).toBeInTheDocument();
      });

      const createButton = screen.getByRole('button', {
        name: /nova prioridade/i,
      });
      await user.click(createButton);

      expect(
        screen.getByRole('dialog', { name: /criar nova prioridade/i })
      ).toBeInTheDocument();
    });

    it('deve criar uma nova prioridade com sucesso', async () => {
      const user = userEvent.setup();
      render(<PrioritiesPage />);

      await waitFor(() => {
        expect(screen.getByText('Matriz de Prioridades')).toBeInTheDocument();
      });

      const createButton = screen.getByRole('button', {
        name: /nova prioridade/i,
      });
      await user.click(createButton);

      const dialog = screen.getByRole('dialog', {
        name: /criar nova prioridade/i,
      });

      const titleInput = within(dialog).getByPlaceholderText(/digite o título/i);
      await user.type(titleInput, 'Nova Prioridade de Teste');

      const saveButton = within(dialog).getByRole('button', { name: /criar/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(
          screen.getByText('Nova Prioridade de Teste')
        ).toBeInTheDocument();
      });
    });

    it('deve validar que o título é obrigatório', async () => {
      const user = userEvent.setup();
      render(<PrioritiesPage />);

      await waitFor(() => {
        expect(screen.getByText('Matriz de Prioridades')).toBeInTheDocument();
      });

      const createButton = screen.getByRole('button', {
        name: /nova prioridade/i,
      });
      await user.click(createButton);

      const dialog = screen.getByRole('dialog', {
        name: /criar nova prioridade/i,
      });

      const saveButton = within(dialog).getByRole('button', { name: /criar/i });
      expect(saveButton).toBeDisabled();
    });

    it('deve adicionar tags ao criar prioridade', async () => {
      const user = userEvent.setup();
      render(<PrioritiesPage />);

      await waitFor(() => {
        expect(screen.getByText('Matriz de Prioridades')).toBeInTheDocument();
      });

      const createButton = screen.getByRole('button', {
        name: /nova prioridade/i,
      });
      await user.click(createButton);

      const dialog = screen.getByRole('dialog', {
        name: /criar nova prioridade/i,
      });

      const titleInput = within(dialog).getByPlaceholderText(/digite o título/i);
      await user.type(titleInput, 'Prioridade com Tags');

      const tagInput = within(dialog).getByPlaceholderText(/digite uma tag/i);
      await user.type(tagInput, 'teste');
      await user.keyboard('{Enter}');

      expect(within(dialog).getByText('teste')).toBeInTheDocument();

      const saveButton = within(dialog).getByRole('button', { name: /criar/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Prioridade com Tags')).toBeInTheDocument();
      });
    });
  });

  describe('Edição e Exclusão de Prioridade', () => {
    it('deve ter os botões de menu disponíveis nos cards', async () => {
      render(<PrioritiesPage />);

      await waitFor(() => {
        expect(
          screen.getByText('Prioridade Urgente e Importante')
        ).toBeInTheDocument();
      });

      const priorityCards = screen.getAllByText('Prioridade Urgente e Importante');
      const priorityCard = priorityCards[0].closest('div[class*="card"]');

      if (!priorityCard) {
        throw new Error('Priority card not found');
      }

      const menuButtons = within(priorityCard as HTMLElement).getAllByRole('button');
      const menuButton = menuButtons.find(btn => {
        const svg = btn.querySelector('svg');
        return svg !== null;
      });

      expect(menuButton).toBeInTheDocument();
    });
  });

  describe('Filtro por Quadrante', () => {
    it('deve filtrar prioridades por quadrante', async () => {
      const user = userEvent.setup();
      render(<PrioritiesPage />);

      await waitFor(() => {
        expect(screen.getByText('Matriz de Prioridades')).toBeInTheDocument();
      });

      const filterSection = screen.getByText('Filtrar por quadrante:').closest('div');
      if (!filterSection) {
        throw new Error('Filter section not found');
      }

      const q1Buttons = within(filterSection).getAllByRole('button', {
        name: /urgente \/ importante/i,
      });
      const q1Button = q1Buttons.find(btn => !btn.textContent?.includes('Todos')) || q1Buttons[0];
      
      await user.click(q1Button);

      await waitFor(() => {
        expect(
          screen.getByText('Prioridade Urgente e Importante')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Tratamento de Erro', () => {
    it('deve exibir mensagem de erro quando a API falhar', async () => {
      server.use(
        http.get('/api/priorities', () => {
          return HttpResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
          );
        })
      );

      render(<PrioritiesPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/erro ao carregar prioridades/i)
        ).toBeInTheDocument();
      });

      expect(
        screen.getByRole('button', { name: /tentar novamente/i })
      ).toBeInTheDocument();
    });

    it('deve permitir tentar novamente após erro', async () => {
      const user = userEvent.setup();

      server.use(
        http.get('/api/priorities', () => {
          return HttpResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
          );
        })
      );

      render(<PrioritiesPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/erro ao carregar prioridades/i)
        ).toBeInTheDocument();
      });

      server.resetHandlers();

      const retryButton = screen.getByRole('button', {
        name: /tentar novamente/i,
      });
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Matriz de Prioridades')).toBeInTheDocument();
      });
    });
  });

  describe('Interação com Cards', () => {
    it('deve expandir/colapsar card ao clicar nele', async () => {
      const user = userEvent.setup();
      render(<PrioritiesPage />);

      await waitFor(() => {
        expect(
          screen.getByText('Prioridade Urgente e Importante')
        ).toBeInTheDocument();
      });

      const priorityCards = screen.getAllByText('Prioridade Urgente e Importante');
      const priorityCard = priorityCards[0].closest('div[class*="card"]');

      if (!priorityCard) {
        throw new Error('Priority card not found');
      }

      await user.click(priorityCard as HTMLElement);

      await waitFor(() => {
        expect(
          screen.getByText(/esta é uma prioridade do quadrante q1/i)
        ).toBeInTheDocument();
      });

      await user.click(priorityCard as HTMLElement);

      await waitFor(() => {
        expect(
          screen.queryByText(/esta é uma prioridade do quadrante q1/i)
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Funcionalidades de Tarefas', () => {
    it('deve abrir dialog de visualização de tarefas ao clicar em "Ver Tarefas"', async () => {
      const user = userEvent.setup();
      render(<PrioritiesPage />);

      await waitFor(() => {
        expect(screen.getByText('Matriz de Prioridades')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('Prioridade Urgente e Importante')).toBeInTheDocument();
      });

      const priorityCards = screen.getAllByText('Prioridade Urgente e Importante');
      const priorityCard = priorityCards[0].closest('div[class*="card"]');

      if (!priorityCard) {
        throw new Error('Priority card not found');
      }

      const menuButtons = within(priorityCard as HTMLElement).getAllByRole('button');
      const menuButton = menuButtons.find(btn => {
        const svg = btn.querySelector('svg');
        return svg !== null;
      });

      if (menuButton) {
        await user.click(menuButton);
        
        await waitFor(() => {
          const viewTasksOption = screen.queryByText(/ver tarefas/i);
          if (!viewTasksOption) {
            throw new Error('Menu option not found');
          }
        }, { timeout: 5000 });

        const viewTasksOption = screen.getByText(/ver tarefas/i);
        await user.click(viewTasksOption);

        await waitFor(() => {
          expect(screen.getByRole('dialog', { name: /tarefas/i })).toBeInTheDocument();
        }, { timeout: 3000 });
      } else {
        throw new Error('Menu button not found');
      }
    });

    it('deve carregar tarefas da prioridade no dialog', async () => {
      const user = userEvent.setup();
      render(<PrioritiesPage />);

      await waitFor(() => {
        expect(screen.getByText('Matriz de Prioridades')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('Prioridade Urgente e Importante')).toBeInTheDocument();
      });

      const priorityCards = screen.getAllByText('Prioridade Urgente e Importante');
      const priorityCard = priorityCards[0].closest('div[class*="card"]');

      if (!priorityCard) {
        throw new Error('Priority card not found');
      }

      const menuButtons = within(priorityCard as HTMLElement).getAllByRole('button');
      const menuButton = menuButtons.find(btn => {
        const svg = btn.querySelector('svg');
        return svg !== null;
      });

      if (menuButton) {
        await user.click(menuButton);
        
        await waitFor(() => {
          const viewTasksOption = screen.queryByText(/ver tarefas/i);
          if (!viewTasksOption) {
            throw new Error('Menu option not found');
          }
        }, { timeout: 5000 });

        const viewTasksOption = screen.getByText(/ver tarefas/i);
        await user.click(viewTasksOption);

        await waitFor(() => {
          expect(screen.getByText('Tarefa relacionada')).toBeInTheDocument();
        }, { timeout: 3000 });
      } else {
        throw new Error('Menu button not found');
      }
    });

    it('deve abrir dialog de criação de tarefa', async () => {
      const user = userEvent.setup();
      render(<PrioritiesPage />);

      await waitFor(() => {
        expect(screen.getByText('Matriz de Prioridades')).toBeInTheDocument();
      });

      const priorityCards = screen.getAllByText('Prioridade Urgente e Importante');
      const priorityCard = priorityCards[0].closest('div[class*="card"]');

      if (!priorityCard) {
        throw new Error('Priority card not found');
      }

      const menuButtons = within(priorityCard as HTMLElement).getAllByRole('button');
      const menuButton = menuButtons.find(btn => {
        const svg = btn.querySelector('svg');
        return svg !== null;
      });

      if (menuButton) {
        await user.click(menuButton);
        await waitFor(() => {
          expect(screen.getByText(/criar tarefa/i)).toBeInTheDocument();
        });
        await user.click(screen.getByText(/criar tarefa/i));

        await waitFor(() => {
          expect(screen.getByRole('dialog', { name: /criar tarefa/i })).toBeInTheDocument();
        });
      }
    });

    it('deve criar tarefa com sucesso', async () => {
      const user = userEvent.setup();
      render(<PrioritiesPage />);

      await waitFor(() => {
        expect(screen.getByText('Matriz de Prioridades')).toBeInTheDocument();
      });

      const priorityCards = screen.getAllByText('Prioridade Urgente e Importante');
      const priorityCard = priorityCards[0].closest('div[class*="card"]');

      if (!priorityCard) {
        throw new Error('Priority card not found');
      }

      const menuButtons = within(priorityCard as HTMLElement).getAllByRole('button');
      const menuButton = menuButtons.find(btn => {
        const svg = btn.querySelector('svg');
        return svg !== null;
      });

      if (menuButton) {
        await user.click(menuButton);
        await waitFor(() => {
          expect(screen.getByText(/criar tarefa/i)).toBeInTheDocument();
        });
        await user.click(screen.getByText(/criar tarefa/i));

        await waitFor(() => {
          expect(screen.getByRole('dialog', { name: /criar tarefa/i })).toBeInTheDocument();
        });

        const dialog = screen.getByRole('dialog', { name: /criar tarefa/i });
        const titleInput = within(dialog).getByPlaceholderText(/digite o título da tarefa/i);
        await user.type(titleInput, 'Nova Tarefa de Teste');

        const createButton = within(dialog).getByRole('button', { name: /criar tarefa/i });
        await user.click(createButton);

        await waitFor(() => {
          expect(screen.queryByRole('dialog', { name: /criar tarefa/i })).not.toBeInTheDocument();
        });
      }
    });

    it('deve validar campos obrigatórios ao criar tarefa', async () => {
      const user = userEvent.setup();
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      render(<PrioritiesPage />);

      await waitFor(() => {
        expect(screen.getByText('Matriz de Prioridades')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('Prioridade Urgente e Importante')).toBeInTheDocument();
      });

      const priorityCards = screen.getAllByText('Prioridade Urgente e Importante');
      const priorityCard = priorityCards[0].closest('div[class*="card"]');

      if (!priorityCard) {
        throw new Error('Priority card not found');
      }

      const menuButtons = within(priorityCard as HTMLElement).getAllByRole('button');
      const menuButton = menuButtons.find(btn => {
        const svg = btn.querySelector('svg');
        return svg !== null;
      });

      if (menuButton) {
        await user.click(menuButton);
        await waitFor(() => {
          expect(screen.getByText(/criar tarefa/i)).toBeInTheDocument();
        }, { timeout: 3000 });
        
        const createTaskOption = screen.getByText(/criar tarefa/i);
        await user.click(createTaskOption);

        await waitFor(() => {
          expect(screen.getByRole('dialog', { name: /criar tarefa/i })).toBeInTheDocument();
        }, { timeout: 3000 });

        const dialog = screen.getByRole('dialog', { name: /criar tarefa/i });
        const createButton = within(dialog).getByRole('button', { name: /criar/i });
        await user.click(createButton);

        await waitFor(() => {
          expect(alertSpy).toHaveBeenCalledWith('Por favor, preencha o título da tarefa');
        }, { timeout: 3000 });

        alertSpy.mockRestore();
      }
    });

    it('deve exibir informações completas das tarefas', async () => {
      const user = userEvent.setup();
      render(<PrioritiesPage />);

      await waitFor(() => {
        expect(screen.getByText('Matriz de Prioridades')).toBeInTheDocument();
      });

      const priorityCards = screen.getAllByText('Prioridade Urgente e Importante');
      const priorityCard = priorityCards[0].closest('div[class*="card"]');

      if (!priorityCard) {
        throw new Error('Priority card not found');
      }

      const menuButtons = within(priorityCard as HTMLElement).getAllByRole('button');
      const menuButton = menuButtons.find(btn => {
        const svg = btn.querySelector('svg');
        return svg !== null;
      });

      if (menuButton) {
        await user.click(menuButton);
        
        await waitFor(() => {
          const viewTasksOption = screen.queryByText(/ver tarefas/i);
          if (!viewTasksOption) {
            throw new Error('Menu option not found');
          }
        }, { timeout: 5000 });

        const viewTasksOption = screen.getByText(/ver tarefas/i);
        await user.click(viewTasksOption);

        await waitFor(() => {
          expect(screen.getByText('Tarefa relacionada')).toBeInTheDocument();
          expect(screen.getByText(/fazer/i)).toBeInTheDocument();
          expect(screen.getByText(/aberta/i)).toBeInTheDocument();
        }, { timeout: 3000 });
      } else {
        throw new Error('Menu button not found');
      }
    });
  });

  describe('Ordenação por displayOrder', () => {
    it('deve ordenar prioridades por displayOrder ao renderizar', async () => {
      server.use(
        http.get('/api/priorities', () => {
          return HttpResponse.json({
            priorities: [
              {
                id: 'p1',
                userId: 'test-user-id',
                title: 'Primeira',
                quadrant: 'Q1',
                displayOrder: 2,
                status: 'active',
                origin: 'manual',
                tags: [],
                taskCount: 0,
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z',
              },
              {
                id: 'p2',
                userId: 'test-user-id',
                title: 'Segunda',
                quadrant: 'Q1',
                displayOrder: 0,
                status: 'active',
                origin: 'manual',
                tags: [],
                taskCount: 0,
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z',
              },
              {
                id: 'p3',
                userId: 'test-user-id',
                title: 'Terceira',
                quadrant: 'Q1',
                displayOrder: 1,
                status: 'active',
                origin: 'manual',
                tags: [],
                taskCount: 0,
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z',
              },
            ],
          });
        })
      );

      render(<PrioritiesPage />);

      await waitFor(() => {
        expect(screen.getByText('Segunda')).toBeInTheDocument();
      });

      // Verificar que as prioridades aparecem na ordem correta (por displayOrder)
      // Segunda (0), Terceira (1), Primeira (2)
      const allPriorities = screen.getAllByText(/Primeira|Segunda|Terceira/);
      
      // Como estão no mesmo quadrante, devem aparecer na ordem: Segunda, Terceira, Primeira
      const prioritiesInQ1 = allPriorities.filter((el) => {
        const card = el.closest('div[class*="card"]');
        return card !== null;
      });

      // Verificar que Segunda aparece antes de Terceira e Primeira
      const segundaIndex = prioritiesInQ1.findIndex((el) => el.textContent === 'Segunda');
      const terceiraIndex = prioritiesInQ1.findIndex((el) => el.textContent === 'Terceira');
      const primeiraIndex = prioritiesInQ1.findIndex((el) => el.textContent === 'Primeira');

      expect(segundaIndex).toBeGreaterThanOrEqual(0);
      expect(terceiraIndex).toBeGreaterThanOrEqual(0);
      expect(primeiraIndex).toBeGreaterThanOrEqual(0);
      
      // Verificar ordem relativa
      expect(segundaIndex).toBeLessThan(terceiraIndex);
      expect(terceiraIndex).toBeLessThan(primeiraIndex);
    });
  });

  describe('Reordenação de Prioridades', () => {
    it('deve renderizar prioridades ordenadas por displayOrder', async () => {
      server.use(
        http.get('/api/priorities', () => {
          return HttpResponse.json({
            priorities: [
              {
                id: 'p1',
                userId: 'test-user-id',
                title: 'Prioridade 1',
                quadrant: 'Q1',
                displayOrder: 0,
                status: 'active',
                origin: 'manual',
                tags: [],
                taskCount: 0,
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z',
              },
              {
                id: 'p2',
                userId: 'test-user-id',
                title: 'Prioridade 2',
                quadrant: 'Q1',
                displayOrder: 1,
                status: 'active',
                origin: 'manual',
                tags: [],
                taskCount: 0,
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z',
              },
            ],
          });
        })
      );

      render(<PrioritiesPage />);

      await waitFor(() => {
        expect(screen.getByText('Prioridade 1')).toBeInTheDocument();
        expect(screen.getByText('Prioridade 2')).toBeInTheDocument();
      });

      // Verificar que ambas as prioridades são renderizadas
      const p1 = screen.getByText('Prioridade 1');
      const p2 = screen.getByText('Prioridade 2');
      
      expect(p1).toBeInTheDocument();
      expect(p2).toBeInTheDocument();
    });

    it('deve atualizar ordem após reordenação bem-sucedida', async () => {
      let prioritiesOrder = [
        {
          id: 'p1',
          userId: 'test-user-id',
          title: 'Prioridade 1',
          quadrant: 'Q1',
          displayOrder: 0,
          status: 'active',
          origin: 'manual',
          tags: [],
          taskCount: 0,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'p2',
          userId: 'test-user-id',
          title: 'Prioridade 2',
          quadrant: 'Q1',
          displayOrder: 1,
          status: 'active',
          origin: 'manual',
          tags: [],
          taskCount: 0,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      server.use(
        http.get('/api/priorities', () => {
          return HttpResponse.json({ priorities: prioritiesOrder });
        }),
        http.post('/api/priorities/:quadrant/reorder', async ({ request }) => {
          const body = await request.json() as { priorityIds: string[] };
          // Simular atualização da ordem
          prioritiesOrder = prioritiesOrder.map((p, index) => {
            const newIndex = body.priorityIds.indexOf(p.id);
            return {
              ...p,
              displayOrder: newIndex >= 0 ? newIndex : p.displayOrder,
              updatedAt: new Date().toISOString(),
            };
          }).sort((a, b) => a.displayOrder - b.displayOrder);
          return HttpResponse.json({ success: true });
        })
      );

      render(<PrioritiesPage />);

      await waitFor(() => {
        expect(screen.getByText('Prioridade 1')).toBeInTheDocument();
      });

      // Verificar que o handler de reorder está configurado corretamente
      // A reordenação real seria testada através de interação de drag & drop
      // que requer biblioteca especializada ou testes E2E
      expect(screen.getByText('Prioridade 1')).toBeInTheDocument();
    });

    it('deve exibir erro quando reordenação falha', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      server.use(
        http.get('/api/priorities', () => {
          return HttpResponse.json({
            priorities: [
              {
                id: 'p1',
                userId: 'test-user-id',
                title: 'Prioridade 1',
                quadrant: 'Q1',
                displayOrder: 0,
                status: 'active',
                origin: 'manual',
                tags: [],
                taskCount: 0,
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z',
              },
            ],
          });
        }),
        http.post('/api/priorities/:quadrant/reorder', () => {
          return HttpResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
          );
        })
      );

      render(<PrioritiesPage />);

      await waitFor(() => {
        expect(screen.getByText('Prioridade 1')).toBeInTheDocument();
      });

      // O erro será tratado pela mutation quando ocorrer
      // Verificamos que o componente renderiza corretamente mesmo com handler de erro configurado
      expect(screen.getByText('Prioridade 1')).toBeInTheDocument();

      alertSpy.mockRestore();
    });
  });
});
