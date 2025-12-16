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
});
