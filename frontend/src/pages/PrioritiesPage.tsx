import React, { useState } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EisenhowerQuadrant } from '@/types/priority.types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const quadrantLabels = {
  [EisenhowerQuadrant.Q1]: {
    title: 'Urgente / Importante',
    description: 'Fazer imediatamente',
  },
  [EisenhowerQuadrant.Q2]: {
    title: 'Não Urgente / Importante',
    description: 'Agendar para fazer',
  },
  [EisenhowerQuadrant.Q3]: {
    title: 'Urgente / Não Importante',
    description: 'Delegar se possível',
  },
  [EisenhowerQuadrant.Q4]: {
    title: 'Não Urgente / Não Importante',
    description: 'Eliminar ou fazer depois',
  },
};

interface MockPriority {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  taskCount: number;
  quadrant: EisenhowerQuadrant;
  origin: 'manual' | 'ai';
  status?: 'active' | 'completed' | 'archived';
  createdAt?: string;
  updatedAt?: string;
}

export const PrioritiesPage: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tasksDialogOpen, setTasksDialogOpen] = useState(false);
  const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<MockPriority | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [contextMenu, setContextMenu] = useState<{
    open: boolean;
    x: number;
    y: number;
    priority: MockPriority | null;
  }>({
    open: false,
    x: 0,
    y: 0,
    priority: null,
  });
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [quadrantFilter, setQuadrantFilter] = useState<EisenhowerQuadrant[] | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    quadrant: EisenhowerQuadrant.Q1,
    tags: [] as string[],
    tagInput: '',
  });
  const [priorities, setPriorities] = useState<MockPriority[]>([
    {
      id: '1',
      title: 'Fechar proposta da Congregação',
      description: 'Finalizar proposta comercial para a Congregação com todos os detalhes técnicos e financeiros.',
      tags: ['trabalho', 'urgente'],
      taskCount: 3,
      quadrant: EisenhowerQuadrant.Q1,
      origin: 'manual',
      status: 'active',
      createdAt: '2024-12-01T10:00:00Z',
      updatedAt: '2024-12-05T14:30:00Z',
    },
    {
      id: '2',
      title: 'Revisar contrato com cliente',
      description: 'Revisar termos e condições do contrato antes da assinatura.',
      tags: ['trabalho', 'legal'],
      taskCount: 1,
      quadrant: EisenhowerQuadrant.Q1,
      origin: 'manual',
      status: 'active',
      createdAt: '2024-12-02T09:15:00Z',
      updatedAt: '2024-12-04T16:20:00Z',
    },
    {
      id: '3',
      title: 'Preparar apresentação executiva',
      description: 'Criar slides para apresentação aos executivos sobre os resultados do trimestre.',
      tags: ['trabalho', 'apresentação'],
      taskCount: 5,
      quadrant: EisenhowerQuadrant.Q1,
      origin: 'manual',
      status: 'active',
      createdAt: '2024-12-01T11:00:00Z',
      updatedAt: '2024-12-05T10:00:00Z',
    },
    {
      id: '4',
      title: 'Resolver problema crítico do sistema',
      description: 'Investigar e corrigir falha crítica que está afetando os usuários.',
      tags: ['trabalho', 'tecnologia', 'urgente'],
      taskCount: 2,
      quadrant: EisenhowerQuadrant.Q1,
      origin: 'ai',
      status: 'active',
      createdAt: '2024-12-05T08:00:00Z',
      updatedAt: '2024-12-05T12:00:00Z',
    },
    {
      id: '5',
      title: 'Reunião com equipe de desenvolvimento',
      description: 'Alinhar próximos passos do projeto com a equipe técnica.',
      tags: ['trabalho', 'reunião'],
      taskCount: 0,
      quadrant: EisenhowerQuadrant.Q1,
      origin: 'manual',
      status: 'active',
      createdAt: '2024-12-03T14:00:00Z',
      updatedAt: '2024-12-03T14:00:00Z',
    },
    {
      id: '6',
      title: 'Finalizar relatório mensal',
      description: 'Compilar dados e gerar relatório mensal de atividades e resultados.',
      tags: ['trabalho', 'relatório'],
      taskCount: 4,
      quadrant: EisenhowerQuadrant.Q1,
      origin: 'manual',
      status: 'active',
      createdAt: '2024-12-01T09:00:00Z',
      updatedAt: '2024-12-05T15:00:00Z',
    },
    {
      id: '7',
      title: 'Aprovar orçamento do projeto',
      description: 'Revisar e aprovar orçamento detalhado do novo projeto.',
      tags: ['trabalho', 'financeiro'],
      taskCount: 1,
      quadrant: EisenhowerQuadrant.Q1,
      origin: 'manual',
      status: 'active',
      createdAt: '2024-12-02T10:30:00Z',
      updatedAt: '2024-12-04T11:00:00Z',
    },
    {
      id: '8',
      title: 'Responder emails pendentes',
      description: 'Responder emails importantes que estão aguardando resposta.',
      tags: ['trabalho', 'comunicação'],
      taskCount: 0,
      quadrant: EisenhowerQuadrant.Q1,
      origin: 'manual',
      status: 'active',
      createdAt: '2024-12-05T08:30:00Z',
      updatedAt: '2024-12-05T08:30:00Z',
    },
    {
      id: '9',
      title: 'Atualizar documentação técnica',
      description: 'Atualizar documentação do sistema com as últimas mudanças implementadas.',
      tags: ['trabalho', 'documentação'],
      taskCount: 3,
      quadrant: EisenhowerQuadrant.Q1,
      origin: 'manual',
      status: 'active',
      createdAt: '2024-12-01T13:00:00Z',
      updatedAt: '2024-12-04T17:00:00Z',
    },
    {
      id: '10',
      title: 'Coordenar entrega de produto',
      description: 'Coordenar todas as etapas da entrega do produto ao cliente final.',
      tags: ['trabalho', 'projeto'],
      taskCount: 6,
      quadrant: EisenhowerQuadrant.Q1,
      origin: 'manual',
      status: 'active',
      createdAt: '2024-12-01T08:00:00Z',
      updatedAt: '2024-12-05T13:00:00Z',
    },
    {
      id: '11',
      title: 'Planejar férias de julho',
      description: 'Definir destino, reservar hospedagem e organizar roteiro das férias em família.',
      tags: ['pessoal', 'família'],
      taskCount: 0,
      quadrant: EisenhowerQuadrant.Q2,
      origin: 'manual',
      status: 'active',
      createdAt: '2024-12-01T15:00:00Z',
      updatedAt: '2024-12-02T10:00:00Z',
    },
  ]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceQuadrant = result.source.droppableId as EisenhowerQuadrant;
    const destQuadrant = result.destination.droppableId as EisenhowerQuadrant;
    const priorityId = result.draggableId;

    if (sourceQuadrant === destQuadrant) return;

    setPriorities((prev) =>
      prev.map((p) =>
        p.id === priorityId ? { ...p, quadrant: destQuadrant } : p
      )
    );
  };

  const getPrioritiesByQuadrant = (quadrant: EisenhowerQuadrant) => {
    const filtered = quadrantFilter
      ? priorities.filter((p) => quadrantFilter.includes(p.quadrant) && p.quadrant === quadrant)
      : priorities.filter((p) => p.quadrant === quadrant);
    return filtered.filter((p) => p.status !== 'archived');
  };

  const toggleQuadrantFilter = (quadrant: EisenhowerQuadrant) => {
    setQuadrantFilter((prev) => {
      if (!prev) {
        return [quadrant];
      }
      if (prev.includes(quadrant)) {
        const newFilter = prev.filter((q) => q !== quadrant);
        return newFilter.length === 0 ? null : newFilter;
      }
      return [...prev, quadrant];
    });
  };

  const handleCardClick = (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.defaultPrevented) return;
    
    setExpandedCardId(expandedCardId === cardId ? null : cardId);
  };

  const handleCreatePriority = () => {
    if (!formData.title.trim()) return;

    const newPriority: MockPriority = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description || undefined,
      tags: formData.tags,
      taskCount: 0,
      quadrant: formData.quadrant,
      origin: 'manual',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPriorities((prev) => [...prev, newPriority]);
    setFormData({ title: '', description: '', quadrant: EisenhowerQuadrant.Q1, tags: [], tagInput: '' });
    setDialogOpen(false);
  };

  const handleEditPriority = () => {
    if (!selectedPriority || !formData.title.trim()) return;

    setPriorities((prev) =>
      prev.map((p) =>
        p.id === selectedPriority.id
          ? {
              ...p,
              title: formData.title,
              description: formData.description || undefined,
              tags: formData.tags,
              quadrant: formData.quadrant,
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );

    if (expandedCardId === selectedPriority.id) {
      setExpandedCardId(null);
    }

    setFormData({ title: '', description: '', quadrant: EisenhowerQuadrant.Q1, tags: [], tagInput: '' });
    setSelectedPriority(null);
    setEditDialogOpen(false);
  };

  const handleDeletePriority = () => {
    if (!selectedPriority) return;

    setPriorities((prev) => prev.filter((p) => p.id !== selectedPriority.id));

    if (expandedCardId === selectedPriority.id) {
      setExpandedCardId(null);
    }

    setSelectedPriority(null);
    setDeleteDialogOpen(false);
  };

  const openEditDialog = (priority: MockPriority) => {
    setSelectedPriority(priority);
    setFormData({
      title: priority.title,
      description: priority.description || '',
      quadrant: priority.quadrant,
      tags: priority.tags,
      tagInput: '',
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (priority: MockPriority) => {
    setSelectedPriority(priority);
    setDeleteDialogOpen(true);
  };

  const handleAddTag = () => {
    if (formData.tagInput.trim() && !formData.tags.includes(formData.tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, prev.tagInput.trim()],
        tagInput: '',
      }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleToggleStatus = (priorityId: string) => {
    setPriorities((prev) =>
      prev.map((p) =>
        p.id === priorityId
          ? {
              ...p,
              status: p.status === 'active' ? 'completed' : 'active',
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );
  };

  const handleArchive = (priorityId: string) => {
    setPriorities((prev) =>
      prev.map((p) =>
        p.id === priorityId
          ? {
              ...p,
              status: 'archived',
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );
    if (expandedCardId === priorityId) {
      setExpandedCardId(null);
    }
  };

  const handleViewTasks = (priority: MockPriority) => {
    setSelectedPriority(priority);
    // Mock tasks - em produção, usar priorityService.getTasks
    setTasks([
      { id: '1', title: 'Tarefa exemplo 1', completed: false },
      { id: '2', title: 'Tarefa exemplo 2', completed: true },
    ]);
    setTasksDialogOpen(true);
  };

  const handleCreateTask = (priority: MockPriority) => {
    setSelectedPriority(priority);
    setCreateTaskDialogOpen(true);
  };

  const handleContextMenu = (e: React.MouseEvent, priority: MockPriority) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      open: true,
      x: e.clientX,
      y: e.clientY,
      priority,
    });
  };

  const handleContextMenuAction = (action: string) => {
    if (!contextMenu.priority) return;

    switch (action) {
      case 'edit':
        openEditDialog(contextMenu.priority);
        break;
      case 'view-tasks':
        handleViewTasks(contextMenu.priority);
        break;
      case 'create-task':
        handleCreateTask(contextMenu.priority);
        break;
      case 'archive':
        handleArchive(contextMenu.priority.id);
        break;
      case 'delete':
        openDeleteDialog(contextMenu.priority);
        break;
    }

    setContextMenu({ open: false, x: 0, y: 0, priority: null });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusLabel = (status?: string) => {
    const labels: Record<string, string> = {
      active: 'Ativo',
      completed: 'Concluído',
      archived: 'Arquivado',
    };
    return labels[status || 'active'] || 'Ativo';
  };

  const getStatusColor = (status?: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      archived: 'bg-gray-100 text-gray-800',
    };
    return colors[status || 'active'] || 'bg-green-100 text-green-800';
  };

  return (
    <Layout>
      <div className="flex flex-col h-full overflow-hidden">
        <div className="mb-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-2xl font-bold">Matriz de Prioridades</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Organize suas prioridades usando a Matriz de Eisenhower
            </p>
          </div>
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) {
                setFormData({ title: '', description: '', quadrant: EisenhowerQuadrant.Q1, tags: [], tagInput: '' });
              }
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm">Nova Prioridade</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Prioridade</DialogTitle>
                <DialogDescription>
                  Preencha os dados da nova prioridade
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Título *</label>
                  <Input
                    placeholder="Digite o título..."
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Quadrante *</label>
                  <Select
                    value={formData.quadrant}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, quadrant: value as EisenhowerQuadrant }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(EisenhowerQuadrant).map((quadrant) => (
                        <SelectItem key={quadrant} value={quadrant}>
                          {quadrantLabels[quadrant].title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Descrição (opcional)
                  </label>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Descrição..."
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Tags</label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Digite uma tag..."
                      value={formData.tagInput}
                      onChange={(e) => setFormData((prev) => ({ ...prev, tagInput: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddTag} size="sm">
                      Adicionar
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-destructive"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreatePriority} disabled={!formData.title.trim()}>
                  Criar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Prioridade</DialogTitle>
                <DialogDescription>
                  Atualize os dados da prioridade
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Título *</label>
                  <Input
                    placeholder="Digite o título..."
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Quadrante *</label>
                  <Select
                    value={formData.quadrant}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, quadrant: value as EisenhowerQuadrant }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(EisenhowerQuadrant).map((quadrant) => (
                        <SelectItem key={quadrant} value={quadrant}>
                          {quadrantLabels[quadrant].title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Descrição (opcional)
                  </label>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Descrição..."
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Tags</label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Digite uma tag..."
                      value={formData.tagInput}
                      onChange={(e) => setFormData((prev) => ({ ...prev, tagInput: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddTag} size="sm">
                      Adicionar
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-destructive"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleEditPriority} disabled={!formData.title.trim()}>
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar Exclusão</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja excluir a prioridade "{selectedPriority?.title}"? Esta ação não pode ser desfeita.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleDeletePriority}>
                  Excluir
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={tasksDialogOpen} onOpenChange={setTasksDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Tarefas - {selectedPriority?.title}</DialogTitle>
                <DialogDescription>
                  Lista de tarefas relacionadas a esta prioridade
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                {tasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhuma tarefa encontrada
                  </p>
                ) : (
                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <Card key={task.id}>
                        <CardContent className="p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              readOnly
                              className="rounded"
                            />
                            <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
                              {task.title}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setTasksDialogOpen(false)}>
                  Fechar
                </Button>
                <Button
                  onClick={() => {
                    setTasksDialogOpen(false);
                    if (selectedPriority) {
                      handleCreateTask(selectedPriority);
                    }
                  }}
                >
                  Criar Nova Tarefa
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={createTaskDialogOpen} onOpenChange={setCreateTaskDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Tarefa</DialogTitle>
                <DialogDescription>
                  Criar nova tarefa para a prioridade "{selectedPriority?.title}"
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Título da Tarefa *</label>
                  <Input placeholder="Digite o título da tarefa..." />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Descrição (opcional)
                  </label>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Descrição da tarefa..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateTaskDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    // Em produção, criar tarefa via service
                    setCreateTaskDialogOpen(false);
                    // Navegar para página de tarefas ou atualizar lista
                  }}
                >
                  Criar Tarefa
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {contextMenu.open && contextMenu.priority && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setContextMenu({ open: false, x: 0, y: 0, priority: null })}
              />
              <div
                className="fixed z-50 min-w-[200px] rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
                style={{
                  left: contextMenu.x,
                  top: contextMenu.y,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
                  onClick={() => handleContextMenuAction('view-tasks')}
                >
                  Ver Tarefas
                </button>
                <button
                  className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
                  onClick={() => handleContextMenuAction('create-task')}
                >
                  Criar Tarefa
                </button>
                <div className="h-px bg-border my-1" />
                <button
                  className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
                  onClick={() => handleContextMenuAction('edit')}
                >
                  Editar
                </button>
                {contextMenu.priority.status !== 'archived' && (
                  <button
                    className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
                    onClick={() => handleContextMenuAction('archive')}
                  >
                    Arquivar
                  </button>
                )}
                <div className="h-px bg-border my-1" />
                <button
                  className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm text-destructive"
                  onClick={() => handleContextMenuAction('delete')}
                >
                  Deletar
                </button>
              </div>
            </>
          )}
        </div>

        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">Filtrar por quadrante:</span>
          <Button
            size="sm"
            variant={quadrantFilter === null ? 'default' : 'outline'}
            onClick={() => setQuadrantFilter(null)}
          >
            Todos
          </Button>
          {Object.values(EisenhowerQuadrant).map((quadrant) => (
            <Button
              key={quadrant}
              size="sm"
              variant={quadrantFilter?.includes(quadrant) ? 'default' : 'outline'}
              onClick={() => toggleQuadrantFilter(quadrant)}
            >
              {quadrantLabels[quadrant].title}
            </Button>
          ))}
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
            {Object.values(EisenhowerQuadrant).map((quadrant) => {
              const quadrantPriorities = getPrioritiesByQuadrant(quadrant);
              const label = quadrantLabels[quadrant];
              const hasMoreThan10 = quadrantPriorities.length >= 10;

              return (
                <Card key={quadrant} className="flex flex-col overflow-hidden">
                  <CardHeader className="flex-shrink-0 pb-3">
                    <CardTitle className="text-base">{label.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {label.description}
                    </p>
                  </CardHeader>
                  <CardContent className="flex-1 min-h-0 p-3">
                    <Droppable droppableId={quadrant}>
                      {(provided: any, snapshot: any) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className={`h-full ${
                            hasMoreThan10 ? 'overflow-y-auto' : 'overflow-y-hidden'
                          } ${
                            snapshot.isDraggingOver
                              ? 'bg-accent/50 rounded-md'
                              : ''
                          }`}
                        >
                          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-1.5 auto-rows-max">
                            {quadrantPriorities.length === 0 ? (
                              <p className="text-xs text-muted-foreground text-center py-4 col-span-full">
                                Nenhuma prioridade neste quadrante
                              </p>
                            ) : (
                              quadrantPriorities.map((priority, index) => (
                                <Draggable
                                  key={priority.id}
                                  draggableId={priority.id}
                                  index={index}
                                >
                                  {(provided: any, snapshot: any) => {
                                    const isExpanded = expandedCardId === priority.id;
                                    
                                    return (
                                      <Card
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className={`cursor-move hover:shadow-sm transition-all duration-300 ${
                                          isExpanded ? 'min-h-[200px]' : 'min-h-[80px]'
                                        } ${
                                          snapshot.isDragging
                                            ? 'shadow-md border-primary bg-primary/5'
                                            : ''
                                        }`}
                                        onClick={(e) => handleCardClick(priority.id, e)}
                                        onContextMenu={(e) => handleContextMenu(e, priority)}
                                      >
                                        <CardContent
                                          className={`p-2 transition-all duration-300 ${
                                            isExpanded ? 'pb-3' : ''
                                          }`}
                                          {...provided.dragHandleProps}
                                        >
                                          <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                              <h3 className="text-sm font-medium mb-0.5 line-clamp-1">
                                                {priority.title}
                                              </h3>
                                              <div className="flex gap-1 flex-wrap mb-1">
                                                {isExpanded
                                                  ? priority.tags.map((tag) => (
                                                      <span
                                                        key={tag}
                                                        className="text-[10px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded"
                                                      >
                                                        {tag}
                                                      </span>
                                                    ))
                                                  : (
                                                    <>
                                                      {priority.tags.slice(0, 2).map((tag) => (
                                                        <span
                                                          key={tag}
                                                          className="text-[10px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded"
                                                        >
                                                          {tag}
                                                        </span>
                                                      ))}
                                                      {priority.tags.length > 2 && (
                                                        <span className="text-[10px] text-muted-foreground">
                                                          +{priority.tags.length - 2}
                                                        </span>
                                                      )}
                                                    </>
                                                  )}
                                              </div>
                                              
                                              {isExpanded && (
                                                <div className="mt-2 space-y-2 animate-in fade-in duration-300">
                                                  {priority.description && (
                                                    <div className="text-xs text-muted-foreground">
                                                      <p className="line-clamp-3">{priority.description}</p>
                                                    </div>
                                                  )}
                                                  
                                                  <div className="flex items-center gap-2 flex-wrap">
                                                    <span
                                                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getStatusColor(
                                                        priority.status
                                                      )}`}
                                                    >
                                                      {getStatusLabel(priority.status)}
                                                    </span>
                                                    {priority.status !== 'archived' && (
                                                      <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-6 text-[10px] px-2"
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          handleToggleStatus(priority.id);
                                                        }}
                                                      >
                                                        {priority.status === 'active'
                                                          ? 'Marcar como concluído'
                                                          : 'Reativar'}
                                                      </Button>
                                                    )}
                                                  </div>
                                                  
                                                  <div className="space-y-1 pt-2 border-t border-border">
                                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                                      <button
                                                        type="button"
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          handleViewTasks(priority);
                                                        }}
                                                        className="hover:underline text-primary"
                                                      >
                                                        {priority.taskCount} tarefa
                                                        {priority.taskCount !== 1 ? 's' : ''}
                                                      </button>
                                                      <span className="capitalize">
                                                        {priority.origin}
                                                      </span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                      <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-6 text-[10px] px-2"
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          handleCreateTask(priority);
                                                        }}
                                                      >
                                                        Criar Tarefa
                                                      </Button>
                                                    </div>
                                                    
                                                    <div className="flex flex-col gap-0.5 text-[10px] text-muted-foreground">
                                                      <span>
                                                        Criado em: {formatDate(priority.createdAt)}
                                                      </span>
                                                      <span>
                                                        Atualizado em: {formatDate(priority.updatedAt)}
                                                      </span>
                                                    </div>
                                                  </div>
                                                </div>
                                              )}
                                              
                                              {!isExpanded && (
                                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                                  <span>
                                                    {priority.taskCount} tarefa
                                                    {priority.taskCount !== 1 ? 's' : ''}
                                                  </span>
                                                  <span className="capitalize">
                                                    {priority.origin}
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-6 w-6 flex-shrink-0"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                  }}
                                                  onMouseDown={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                  }}
                                                >
                                                  <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="12"
                                                    height="12"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                  >
                                                    <circle cx="12" cy="12" r="1" />
                                                    <circle cx="19" cy="12" r="1" />
                                                    <circle cx="5" cy="12" r="1" />
                                                  </svg>
                                                </Button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewTasks(priority);
                                                  }}
                                                >
                                                  Ver Tarefas
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCreateTask(priority);
                                                  }}
                                                >
                                                  Criar Tarefa
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    openEditDialog(priority);
                                                  }}
                                                >
                                                  Editar
                                                </DropdownMenuItem>
                                                {priority.status !== 'archived' && (
                                                  <DropdownMenuItem
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleArchive(priority.id);
                                                    }}
                                                  >
                                                    Arquivar
                                                  </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    openDeleteDialog(priority);
                                                  }}
                                                  className="text-destructive"
                                                >
                                                  Deletar
                                                </DropdownMenuItem>
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    );
                                  }}
                                </Draggable>
                              ))
                            )}
                            {provided.placeholder}
                          </div>
                        </div>
                      )}
                    </Droppable>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </Layout>
  );
};
