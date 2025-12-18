import React, { useState } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { priorityService } from '@/services/priority.service';
import { taskService } from '@/services/task.service';
import {
  EisenhowerQuadrant,
  PriorityResponseDto,
  PriorityStatus,
  PriorityOrigin,
  CreatePriorityDto,
  UpdatePriorityDto,
} from '@/types/priority.types';
import {
  CreateTaskDto,
  UpdateTaskDto,
  MoveTaskDto,
  TaskClassification,
  TaskStatus,
  TaskOrigin,
  TaskResponseDto,
} from '@/types/task.types';
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


export const PrioritiesPage: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tasksDialogOpen, setTasksDialogOpen] = useState(false);
  const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState(false);
  const [editTaskDialogOpen, setEditTaskDialogOpen] = useState(false);
  const [deleteTaskDialogOpen, setDeleteTaskDialogOpen] = useState(false);
  const [moveTaskDialogOpen, setMoveTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const { token, isLoading: authLoading, error: authError } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPriority, setSelectedPriority] = useState<PriorityResponseDto | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    open: boolean;
    x: number;
    y: number;
    priority: PriorityResponseDto | null;
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
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    classification: TaskClassification.DO,
    idealDate: '',
    responsible: '',
  });
  const [moveTaskFormData, setMoveTaskFormData] = useState({
    classification: TaskClassification.DO,
    idealDate: '',
    responsible: '',
  });
  const { data: priorities = [], isLoading, error } = useQuery({
    queryKey: ['priorities'],
    queryFn: () => priorityService.getAll(token),
    enabled: !!token && !authLoading,
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', selectedPriority?.id],
    queryFn: () => priorityService.getTasks(token!, selectedPriority!.id),
    enabled: !!selectedPriority && !!token && tasksDialogOpen,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePriorityDto) => priorityService.create(token!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['priorities'] });
      setDialogOpen(false);
      setFormData({ title: '', description: '', quadrant: EisenhowerQuadrant.Q1, tags: [], tagInput: '' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePriorityDto }) =>
      priorityService.update(token!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['priorities'] });
      setEditDialogOpen(false);
      if (expandedCardId === selectedPriority?.id) {
        setExpandedCardId(null);
      }
      setSelectedPriority(null);
      setFormData({ title: '', description: '', quadrant: EisenhowerQuadrant.Q1, tags: [], tagInput: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => priorityService.delete(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['priorities'] });
      setDeleteDialogOpen(false);
      if (expandedCardId === selectedPriority?.id) {
        setExpandedCardId(null);
      }
      setSelectedPriority(null);
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: CreateTaskDto) => {
      if (!selectedPriority) {
        throw new Error('Prioridade não selecionada');
      }
      return taskService.create(token!, selectedPriority.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', selectedPriority?.id] });
      queryClient.invalidateQueries({ queryKey: ['priorities'] });
      setCreateTaskDialogOpen(false);
      setTaskFormData({ title: '', description: '', classification: TaskClassification.DO, idealDate: '', responsible: '' });
    },
    onError: (error: any) => {
      console.error('Erro ao criar tarefa:', error);
      alert('Erro ao criar tarefa. Verifique o console para mais detalhes.');
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskDto }) =>
      taskService.update(token!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', selectedPriority?.id] });
      queryClient.invalidateQueries({ queryKey: ['priorities'] });
      setEditTaskDialogOpen(false);
      setSelectedTask(null);
      setTaskFormData({ title: '', description: '', classification: TaskClassification.DO, idealDate: '', responsible: '' });
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar tarefa:', error);
      alert('Erro ao atualizar tarefa. Verifique o console para mais detalhes.');
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => taskService.delete(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', selectedPriority?.id] });
      queryClient.invalidateQueries({ queryKey: ['priorities'] });
      setDeleteTaskDialogOpen(false);
      setSelectedTask(null);
    },
    onError: (error: any) => {
      console.error('Erro ao deletar tarefa:', error);
      alert('Erro ao deletar tarefa. Verifique o console para mais detalhes.');
    },
  });

  const completeTaskMutation = useMutation({
    mutationFn: (id: string) => taskService.complete(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', selectedPriority?.id] });
      queryClient.invalidateQueries({ queryKey: ['priorities'] });
    },
    onError: (error: any) => {
      console.error('Erro ao completar tarefa:', error);
      alert('Erro ao completar tarefa. Verifique o console para mais detalhes.');
    },
  });

  const cancelTaskMutation = useMutation({
    mutationFn: (id: string) => taskService.cancel(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', selectedPriority?.id] });
      queryClient.invalidateQueries({ queryKey: ['priorities'] });
    },
    onError: (error: any) => {
      console.error('Erro ao cancelar tarefa:', error);
      alert('Erro ao cancelar tarefa. Verifique o console para mais detalhes.');
    },
  });

  const moveTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: MoveTaskDto }) =>
      taskService.move(token!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', selectedPriority?.id] });
      queryClient.invalidateQueries({ queryKey: ['priorities'] });
      setMoveTaskDialogOpen(false);
      setSelectedTask(null);
      setMoveTaskFormData({ classification: TaskClassification.DO, idealDate: '', responsible: '' });
    },
    onError: (error: any) => {
      console.error('Erro ao mover tarefa:', error);
      alert('Erro ao mover tarefa. Verifique o console para mais detalhes.');
    },
  });

  const moveMutation = useMutation({
    mutationFn: ({ id, quadrant }: { id: string; quadrant: EisenhowerQuadrant }) =>
      priorityService.move(token!, id, { quadrant }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['priorities'] });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => priorityService.archive(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['priorities'] });
      if (expandedCardId === selectedPriority?.id) {
        setExpandedCardId(null);
      }
      setSelectedPriority(null);
    },
  });

  const reorderMutation = useMutation({
    mutationFn: ({ quadrant, priorityIds }: { quadrant: EisenhowerQuadrant; priorityIds: string[] }) =>
      priorityService.reorder(token!, quadrant, { priorityIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['priorities'] });
    },
    onError: (error: any) => {
      console.error('Erro ao reordenar prioridades:', error);
      alert('Erro ao reordenar prioridades. Verifique o console para mais detalhes.');
      // Invalidar para restaurar ordem original
      queryClient.invalidateQueries({ queryKey: ['priorities'] });
    },
  });

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceQuadrant = result.source.droppableId as EisenhowerQuadrant;
    const destQuadrant = result.destination.droppableId as EisenhowerQuadrant;
    const priorityId = result.draggableId;

    // Se moveu entre quadrantes diferentes
    if (sourceQuadrant !== destQuadrant) {
      moveMutation.mutate({ id: priorityId, quadrant: destQuadrant });
      return;
    }

    // Se moveu dentro do mesmo quadrante (reordenação)
    const quadrantPriorities = getPrioritiesByQuadrant(sourceQuadrant);
    
    // Criar nova ordem baseada no índice de destino
    const newOrder: string[] = [];
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    
    // Remover o item da posição original
    for (let i = 0; i < quadrantPriorities.length; i++) {
      if (i !== sourceIndex) {
        newOrder.push(quadrantPriorities[i].id);
      }
    }
    
    // Inserir na nova posição
    newOrder.splice(destIndex, 0, priorityId);
    
    // Chamar reorder mutation
    reorderMutation.mutate({
      quadrant: sourceQuadrant,
      priorityIds: newOrder,
    });
  };

  const getPrioritiesByQuadrant = (quadrant: EisenhowerQuadrant) => {
    let filtered = priorities.filter((p) => p.quadrant === quadrant);
    
    filtered = filtered.filter((p) => p.status !== PriorityStatus.ARCHIVED);
    
    // Ordenar por displayOrder
    filtered.sort((a, b) => a.displayOrder - b.displayOrder);
    
    if (quadrantFilter && !quadrantFilter.includes(quadrant)) {
      return [];
    }
    
    return filtered;
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
    createMutation.mutate({
      title: formData.title,
      description: formData.description || undefined,
      quadrant: formData.quadrant,
      tags: formData.tags,
      origin: PriorityOrigin.MANUAL,
    });
  };

  const handleEditPriority = () => {
    if (!selectedPriority || !formData.title.trim()) return;
    updateMutation.mutate({
      id: selectedPriority.id,
      data: {
        title: formData.title,
        description: formData.description || undefined,
        quadrant: formData.quadrant,
        tags: formData.tags,
      },
    });
  };

  const handleDeletePriority = () => {
    if (!selectedPriority) return;
    deleteMutation.mutate(selectedPriority.id);
  };

  const openEditDialog = (priority: PriorityResponseDto) => {
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

  const openDeleteDialog = (priority: PriorityResponseDto) => {
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
    const priority = priorities.find((p) => p.id === priorityId);
    if (!priority) return;

    const newStatus =
      priority.status === PriorityStatus.ACTIVE
        ? PriorityStatus.COMPLETED
        : PriorityStatus.ACTIVE;

    updateMutation.mutate({
      id: priorityId,
      data: { status: newStatus },
    });
  };

  const handleArchive = (priorityId: string) => {
    archiveMutation.mutate(priorityId);
  };

  const handleViewTasks = (priority: PriorityResponseDto) => {
    setSelectedPriority(priority);
    setTasksDialogOpen(true);
  };

  const handleCreateTask = (priority: PriorityResponseDto) => {
    setSelectedPriority(priority);
    setTaskFormData({ title: '', description: '', classification: TaskClassification.DO, idealDate: '', responsible: '' });
    setCreateTaskDialogOpen(true);
  };

  const handleEditTask = (task: TaskResponseDto) => {
    setSelectedTask(task);
    setTaskFormData({
      title: task.title,
      description: task.description || '',
      classification: task.classification,
      idealDate: task.idealDate || '',
      responsible: task.responsible || '',
    });
    setEditTaskDialogOpen(true);
  };

  const handleDeleteTask = (task: TaskResponseDto) => {
    setSelectedTask(task);
    setDeleteTaskDialogOpen(true);
  };

  const handleMoveTask = (task: TaskResponseDto) => {
    setSelectedTask(task);
    setMoveTaskFormData({
      classification: task.classification,
      idealDate: task.idealDate || '',
      responsible: task.responsible || '',
    });
    setMoveTaskDialogOpen(true);
  };

  const handleCompleteTask = (taskId: string) => {
    completeTaskMutation.mutate(taskId);
  };

  const handleCancelTask = (taskId: string) => {
    cancelTaskMutation.mutate(taskId);
  };

  const getTaskStatusLabel = (status: TaskStatus) => {
    const labels: Record<TaskStatus, string> = {
      [TaskStatus.OPEN]: 'Aberta',
      [TaskStatus.IN_PROGRESS]: 'Em Progresso',
      [TaskStatus.COMPLETED]: 'Concluída',
      [TaskStatus.CANCELLED]: 'Cancelada',
    };
    return labels[status] || status;
  };

  const getTaskStatusColor = (status: TaskStatus) => {
    const colors: Record<TaskStatus, string> = {
      [TaskStatus.OPEN]: 'bg-blue-100 text-blue-800',
      [TaskStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
      [TaskStatus.COMPLETED]: 'bg-green-100 text-green-800',
      [TaskStatus.CANCELLED]: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getClassificationLabel = (classification: TaskClassification) => {
    const labels: Record<TaskClassification, string> = {
      [TaskClassification.DO]: 'Fazer',
      [TaskClassification.SCHEDULE]: 'Agendar',
      [TaskClassification.DELEGATE]: 'Delegar',
      [TaskClassification.ELIMINATE]: 'Eliminar',
    };
    return labels[classification] || classification;
  };

  const handleContextMenu = (e: React.MouseEvent, priority: PriorityResponseDto) => {
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

  const getStatusLabel = (status?: PriorityStatus) => {
    const labels: Record<PriorityStatus, string> = {
      [PriorityStatus.ACTIVE]: 'Ativo',
      [PriorityStatus.COMPLETED]: 'Concluído',
      [PriorityStatus.ARCHIVED]: 'Arquivado',
    };
    return labels[status || PriorityStatus.ACTIVE] || 'Ativo';
  };

  const getStatusColor = (status?: PriorityStatus) => {
    const colors: Record<PriorityStatus, string> = {
      [PriorityStatus.ACTIVE]: 'bg-green-100 text-green-800',
      [PriorityStatus.COMPLETED]: 'bg-blue-100 text-blue-800',
      [PriorityStatus.ARCHIVED]: 'bg-gray-100 text-gray-800',
    };
    return colors[status || PriorityStatus.ACTIVE] || 'bg-green-100 text-green-800';
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </Layout>
    );
  }

  if (authError) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md">
            <p className="text-destructive mb-2 font-medium">Erro de autenticação</p>
            <p className="text-sm text-muted-foreground mb-4">{authError}</p>
            <Button onClick={() => window.location.reload()}>
              Recarregar página
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Carregando prioridades...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-destructive mb-4">Erro ao carregar prioridades</p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['priorities'] })}>
              Tentar novamente
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

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
                <Button
                  onClick={handleCreatePriority}
                  disabled={!formData.title.trim() || createMutation.isPending}
                >
                  {createMutation.isPending ? 'Salvando...' : 'Criar'}
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
                <Button
                  onClick={handleEditPriority}
                  disabled={!formData.title.trim() || updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
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
                <Button
                  variant="destructive"
                  onClick={handleDeletePriority}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
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
                {tasksLoading ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Carregando tarefas...
                  </p>
                ) : tasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhuma tarefa encontrada
                  </p>
                ) : (
                  <div className="space-y-2">
                    {tasks.map((task: TaskResponseDto) => (
                      <Card key={task.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <input
                                  type="checkbox"
                                  checked={task.status === TaskStatus.COMPLETED}
                                  onChange={(e) => {
                                    if (e.target.checked && task.status !== TaskStatus.COMPLETED) {
                                      handleCompleteTask(task.id);
                                    }
                                  }}
                                  disabled={task.status === TaskStatus.COMPLETED || completeTaskMutation.isPending}
                                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer disabled:opacity-50"
                                  title={task.status === TaskStatus.COMPLETED ? 'Tarefa já está completa' : 'Marcar como completa'}
                                />
                                <h4 className={`font-medium ${task.status === TaskStatus.COMPLETED ? 'line-through text-muted-foreground' : ''}`}>
                                  {task.title}
                                </h4>
                                <span className={`text-xs px-2 py-1 rounded ${getTaskStatusColor(task.status)}`}>
                                  {getTaskStatusLabel(task.status)}
                                </span>
                                <span className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground">
                                  {getClassificationLabel(task.classification)}
                            </span>
                              </div>
                              {task.description && (
                                <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                              )}
                              <div className="flex gap-4 text-xs text-muted-foreground">
                                {task.idealDate && (
                                  <span>Data ideal: {new Date(task.idealDate).toLocaleDateString('pt-BR')}</span>
                                )}
                                {task.responsible && (
                                  <span>Responsável: {task.responsible}</span>
                                )}
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
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
                                <DropdownMenuItem onClick={() => handleEditTask(task)}>
                                  Editar
                                </DropdownMenuItem>
                                {task.status === TaskStatus.OPEN || task.status === TaskStatus.IN_PROGRESS ? (
                                  <DropdownMenuItem onClick={() => handleCompleteTask(task.id)}>
                                    Completar
                                  </DropdownMenuItem>
                                ) : null}
                                {task.status === TaskStatus.IN_PROGRESS ? (
                                  <DropdownMenuItem onClick={() => handleCancelTask(task.id)}>
                                    Cancelar
                                  </DropdownMenuItem>
                                ) : null}
                                <DropdownMenuItem onClick={() => handleMoveTask(task)}>
                                  Mover
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteTask(task)}
                                  className="text-destructive"
                                >
                                  Deletar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
                  <Input
                    placeholder="Digite o título da tarefa..."
                    value={taskFormData.title}
                    onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Descrição (opcional)
                  </label>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Descrição da tarefa..."
                    value={taskFormData.description}
                    onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Classificação *</label>
                  <Select
                    value={taskFormData.classification}
                    onValueChange={(value) => setTaskFormData({ ...taskFormData, classification: value as TaskClassification })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TaskClassification.DO}>Fazer</SelectItem>
                      <SelectItem value={TaskClassification.SCHEDULE}>Agendar</SelectItem>
                      <SelectItem value={TaskClassification.DELEGATE}>Delegar</SelectItem>
                      <SelectItem value={TaskClassification.ELIMINATE}>Eliminar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {taskFormData.classification === TaskClassification.SCHEDULE && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Data Ideal *</label>
                    <Input
                      type="date"
                      value={taskFormData.idealDate}
                      onChange={(e) => setTaskFormData({ ...taskFormData, idealDate: e.target.value })}
                    />
                  </div>
                )}
                {taskFormData.classification === TaskClassification.DELEGATE && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Responsável *</label>
                    <Input
                      placeholder="Nome do responsável..."
                      value={taskFormData.responsible}
                      onChange={(e) => setTaskFormData({ ...taskFormData, responsible: e.target.value })}
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setCreateTaskDialogOpen(false);
                  setTaskFormData({ title: '', description: '', classification: TaskClassification.DO, idealDate: '', responsible: '' });
                }}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    if (!taskFormData.title.trim()) {
                      alert('Por favor, preencha o título da tarefa');
                      return;
                    }
                    if (taskFormData.classification === TaskClassification.SCHEDULE && !taskFormData.idealDate) {
                      alert('Por favor, preencha a data ideal para tarefas agendadas');
                      return;
                    }
                    if (taskFormData.classification === TaskClassification.DELEGATE && !taskFormData.responsible) {
                      alert('Por favor, preencha o responsável para tarefas delegadas');
                      return;
                    }
                    createTaskMutation.mutate({
                      title: taskFormData.title,
                      description: taskFormData.description || undefined,
                      classification: taskFormData.classification,
                      idealDate: taskFormData.idealDate || undefined,
                      responsible: taskFormData.responsible || undefined,
                      origin: TaskOrigin.MANUAL,
                    });
                  }}
                  disabled={createTaskMutation.isPending}
                >
                  {createTaskMutation.isPending ? 'Criando...' : 'Criar Tarefa'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={editTaskDialogOpen} onOpenChange={setEditTaskDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Tarefa</DialogTitle>
                <DialogDescription>
                  Editar tarefa da prioridade "{selectedPriority?.title}"
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Título da Tarefa *</label>
                  <Input
                    placeholder="Digite o título da tarefa..."
                    value={taskFormData.title}
                    onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Descrição (opcional)
                  </label>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Descrição da tarefa..."
                    value={taskFormData.description}
                    onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Classificação *</label>
                  <Select
                    value={taskFormData.classification}
                    onValueChange={(value) => setTaskFormData({ ...taskFormData, classification: value as TaskClassification })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TaskClassification.DO}>Fazer</SelectItem>
                      <SelectItem value={TaskClassification.SCHEDULE}>Agendar</SelectItem>
                      <SelectItem value={TaskClassification.DELEGATE}>Delegar</SelectItem>
                      <SelectItem value={TaskClassification.ELIMINATE}>Eliminar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {taskFormData.classification === TaskClassification.SCHEDULE && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Data Ideal *</label>
                    <Input
                      type="date"
                      value={taskFormData.idealDate}
                      onChange={(e) => setTaskFormData({ ...taskFormData, idealDate: e.target.value })}
                    />
                  </div>
                )}
                {taskFormData.classification === TaskClassification.DELEGATE && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Responsável *</label>
                    <Input
                      placeholder="Nome do responsável..."
                      value={taskFormData.responsible}
                      onChange={(e) => setTaskFormData({ ...taskFormData, responsible: e.target.value })}
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setEditTaskDialogOpen(false);
                  setSelectedTask(null);
                  setTaskFormData({ title: '', description: '', classification: TaskClassification.DO, idealDate: '', responsible: '' });
                }}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    if (!taskFormData.title.trim()) {
                      alert('Por favor, preencha o título da tarefa');
                      return;
                    }
                    if (taskFormData.classification === TaskClassification.SCHEDULE && !taskFormData.idealDate) {
                      alert('Por favor, preencha a data ideal para tarefas agendadas');
                      return;
                    }
                    if (taskFormData.classification === TaskClassification.DELEGATE && !taskFormData.responsible) {
                      alert('Por favor, preencha o responsável para tarefas delegadas');
                      return;
                    }
                    if (!selectedTask) return;
                    updateTaskMutation.mutate({
                      id: selectedTask.id,
                      data: {
                        title: taskFormData.title,
                        description: taskFormData.description || undefined,
                        classification: taskFormData.classification,
                        idealDate: taskFormData.idealDate || undefined,
                        responsible: taskFormData.responsible || undefined,
                      },
                    });
                  }}
                  disabled={updateTaskMutation.isPending}
                >
                  {updateTaskMutation.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={deleteTaskDialogOpen} onOpenChange={setDeleteTaskDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar Exclusão</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja excluir a tarefa "{selectedTask?.title}"? Esta ação não pode ser desfeita.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setDeleteTaskDialogOpen(false);
                  setSelectedTask(null);
                }}>
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (!selectedTask) return;
                    deleteTaskMutation.mutate(selectedTask.id);
                  }}
                  disabled={deleteTaskMutation.isPending}
                >
                  {deleteTaskMutation.isPending ? 'Excluindo...' : 'Excluir'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={moveTaskDialogOpen} onOpenChange={setMoveTaskDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Mover Tarefa</DialogTitle>
                <DialogDescription>
                  Mover tarefa "{selectedTask?.title}" para outra classificação
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Nova Classificação *</label>
                  <Select
                    value={moveTaskFormData.classification}
                    onValueChange={(value) => setMoveTaskFormData({ ...moveTaskFormData, classification: value as TaskClassification })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TaskClassification.DO}>Fazer</SelectItem>
                      <SelectItem value={TaskClassification.SCHEDULE}>Agendar</SelectItem>
                      <SelectItem value={TaskClassification.DELEGATE}>Delegar</SelectItem>
                      <SelectItem value={TaskClassification.ELIMINATE}>Eliminar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {moveTaskFormData.classification === TaskClassification.SCHEDULE && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Data Ideal *</label>
                    <Input
                      type="date"
                      value={moveTaskFormData.idealDate}
                      onChange={(e) => setMoveTaskFormData({ ...moveTaskFormData, idealDate: e.target.value })}
                    />
                  </div>
                )}
                {moveTaskFormData.classification === TaskClassification.DELEGATE && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Responsável *</label>
                    <Input
                      placeholder="Nome do responsável..."
                      value={moveTaskFormData.responsible}
                      onChange={(e) => setMoveTaskFormData({ ...moveTaskFormData, responsible: e.target.value })}
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setMoveTaskDialogOpen(false);
                  setSelectedTask(null);
                  setMoveTaskFormData({ classification: TaskClassification.DO, idealDate: '', responsible: '' });
                }}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    if (moveTaskFormData.classification === TaskClassification.SCHEDULE && !moveTaskFormData.idealDate) {
                      alert('Por favor, preencha a data ideal para tarefas agendadas');
                      return;
                    }
                    if (moveTaskFormData.classification === TaskClassification.DELEGATE && !moveTaskFormData.responsible) {
                      alert('Por favor, preencha o responsável para tarefas delegadas');
                      return;
                    }
                    if (!selectedTask) return;
                    moveTaskMutation.mutate({
                      id: selectedTask.id,
                      data: {
                        classification: moveTaskFormData.classification,
                        idealDate: moveTaskFormData.idealDate || undefined,
                        responsible: moveTaskFormData.responsible || undefined,
                      },
                    });
                  }}
                  disabled={moveTaskMutation.isPending}
                >
                  {moveTaskMutation.isPending ? 'Movendo...' : 'Mover'}
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
                {contextMenu.priority.status !== PriorityStatus.ARCHIVED && (
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
                                                    {priority.status !== PriorityStatus.ARCHIVED && (
                                                      <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-6 text-[10px] px-2"
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          handleToggleStatus(priority.id);
                                                        }}
                                                      >
                                                        {priority.status === PriorityStatus.ACTIVE
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
                                                        {priority.taskCount ?? 0} tarefa
                                                        {(priority.taskCount ?? 0) !== 1 ? 's' : ''}
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
                                                      {priority.taskCount ?? 0} tarefa
                                                      {(priority.taskCount ?? 0) !== 1 ? 's' : ''}
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
                                                {priority.status !== PriorityStatus.ARCHIVED && (
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
