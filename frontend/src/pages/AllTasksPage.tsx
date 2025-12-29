import React, { useState, useMemo } from 'react';
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
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { priorityService } from '@/services/priority.service';
import { taskService } from '@/services/task.service';
import {
  TaskClassification,
  TaskStatus,
  TaskOrigin,
  CreateTaskDto,
  UpdateTaskDto,
  MoveTaskDto,
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

const classificationLabels = {
  [TaskClassification.DO]: {
    title: 'Fazer',
    description: 'Tarefas para executar',
  },
  [TaskClassification.SCHEDULE]: {
    title: 'Agendar',
    description: 'Tarefas para agendar',
  },
  [TaskClassification.DELEGATE]: {
    title: 'Delegar',
    description: 'Tarefas para delegar',
  },
  [TaskClassification.ELIMINATE]: {
    title: 'Eliminar',
    description: 'Tarefas para eliminar',
  },
};

interface TaskWithPriority extends TaskResponseDto {
  priorityTitle: string;
}

export const AllTasksPage: React.FC = () => {
  const { token, isLoading: authLoading, error: authError } = useAuth();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [moveTaskDialogOpen, setMoveTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithPriority | null>(null);
  const [selectedPriorityId, setSelectedPriorityId] = useState<string>('');
  const [pendingMove, setPendingMove] = useState<{
    task: TaskWithPriority;
    targetClassification: TaskClassification;
  } | null>(null);

  const [filters, setFilters] = useState({
    priorityId: 'all',
    classification: [] as TaskClassification[],
    status: [] as TaskStatus[],
    searchText: '',
  });

  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    classification: TaskClassification.DO,
    idealDate: '',
    responsible: '',
  });
  const [moveTaskFormData, setMoveTaskFormData] = useState({
    idealDate: '',
    responsible: '',
  });

  const { data: priorities = [], isLoading: prioritiesLoading } = useQuery({
    queryKey: ['priorities'],
    queryFn: () => priorityService.getAll(token),
    enabled: !!token && !authLoading,
  });

  const { data: allTasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['all-tasks', priorities.map((p) => p.id)],
    queryFn: async () => {
      if (!token || priorities.length === 0) return [];
      const tasksPromises = priorities.map(async (priority) => {
        try {
          const tasks = await priorityService.getTasks(token, priority.id);
          return tasks.map((task: TaskResponseDto) => ({
            ...task,
            priorityTitle: priority.title,
          }));
        } catch (error) {
          console.error(`Erro ao buscar tarefas da prioridade ${priority.id}:`, error);
          return [];
        }
      });
      const tasksArrays = await Promise.all(tasksPromises);
      return tasksArrays.flat() as TaskWithPriority[];
    },
    enabled: !!token && !authLoading && priorities.length > 0,
  });

  const filteredTasks = useMemo(() => {
    return allTasks.filter((task) => {
      if (filters.priorityId !== 'all' && task.priorityId !== filters.priorityId) {
        return false;
      }
      if (filters.classification.length > 0 && !filters.classification.includes(task.classification)) {
        return false;
      }
      if (filters.status.length > 0 && !filters.status.includes(task.status)) {
        return false;
      }
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(searchLower);
        const matchesDescription = task.description?.toLowerCase().includes(searchLower) || false;
        if (!matchesTitle && !matchesDescription) {
          return false;
        }
      }
      return true;
    });
  }, [allTasks, filters]);

  const getTasksByClassification = (classification: TaskClassification) => {
    const tasks = filteredTasks.filter((t) => t.classification === classification);
    const order = getTaskOrder(classification);
    
    if (order.length === 0) {
      return tasks;
    }

    const orderedTasks: TaskWithPriority[] = [];
    const unorderedTasks: TaskWithPriority[] = [];

    order.forEach((taskId) => {
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        orderedTasks.push(task);
      }
    });

    tasks.forEach((task) => {
      if (!order.includes(task.id)) {
        unorderedTasks.push(task);
      }
    });

    return [...orderedTasks, ...unorderedTasks];
  };

  const createTaskMutation = useMutation({
    mutationFn: (data: CreateTaskDto) => {
      if (!selectedPriorityId) {
        throw new Error('Prioridade não selecionada');
      }
      return taskService.create(token!, selectedPriorityId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['priorities'] });
      setDialogOpen(false);
      setTaskFormData({
        title: '',
        description: '',
        classification: TaskClassification.DO,
        idealDate: '',
        responsible: '',
      });
      setSelectedPriorityId('');
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
      queryClient.invalidateQueries({ queryKey: ['all-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['priorities'] });
      setEditDialogOpen(false);
      setSelectedTask(null);
      setTaskFormData({
        title: '',
        description: '',
        classification: TaskClassification.DO,
        idealDate: '',
        responsible: '',
      });
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar tarefa:', error);
      alert('Erro ao atualizar tarefa. Verifique o console para mais detalhes.');
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => taskService.delete(token!, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['priorities'] });
      setDeleteDialogOpen(false);
      setSelectedTask(null);
    },
    onError: (error: any) => {
      console.error('Erro ao deletar tarefa:', error);
      alert('Erro ao deletar tarefa. Verifique o console para mais detalhes.');
    },
  });

  const completeTaskMutation = useMutation({
    mutationFn: (taskId: string) => taskService.complete(token!, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['priorities'] });
    },
    onError: (error: any) => {
      console.error('Erro ao completar tarefa:', error);
      alert('Erro ao completar tarefa. Verifique o console para mais detalhes.');
    },
  });

  const cancelTaskMutation = useMutation({
    mutationFn: (taskId: string) => taskService.cancel(token!, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-tasks'] });
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
      queryClient.invalidateQueries({ queryKey: ['all-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['priorities'] });
      setMoveTaskDialogOpen(false);
      setPendingMove(null);
      setMoveTaskFormData({ idealDate: '', responsible: '' });
    },
    onError: (error: any) => {
      console.error('Erro ao mover tarefa:', error);
      alert('Erro ao mover tarefa. Verifique o console para mais detalhes.');
    },
  });

  const getTaskOrder = (classification: TaskClassification): string[] => {
    const key = `task-order-${classification}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  };

  const saveTaskOrder = (classification: TaskClassification, taskIds: string[]) => {
    const key = `task-order-${classification}`;
    localStorage.setItem(key, JSON.stringify(taskIds));
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceClassification = result.source.droppableId as TaskClassification;
    const destClassification = result.destination.droppableId as TaskClassification;
    const taskId = result.draggableId;

    const task = allTasks.find((t) => t.id === taskId);
    if (!task) return;

    if (sourceClassification === destClassification) {
      const tasks = getTasksByClassification(sourceClassification);
      const sourceIndex = result.source.index;
      const destIndex = result.destination.index;

      const newOrder: string[] = [];
      for (let i = 0; i < tasks.length; i++) {
        if (i !== sourceIndex) {
          newOrder.push(tasks[i].id);
        }
      }
      newOrder.splice(destIndex, 0, taskId);

      saveTaskOrder(sourceClassification, newOrder);
      queryClient.invalidateQueries({ queryKey: ['all-tasks'] });
      return;
    }

    if (destClassification === TaskClassification.SCHEDULE || destClassification === TaskClassification.DELEGATE) {
      setPendingMove({ task, targetClassification: destClassification });
      setMoveTaskFormData({
        idealDate: destClassification === TaskClassification.SCHEDULE ? task.idealDate || '' : '',
        responsible: destClassification === TaskClassification.DELEGATE ? task.responsible || '' : '',
      });
      setMoveTaskDialogOpen(true);
      return;
    }

    const moveData: MoveTaskDto = {
      classification: destClassification,
    };

    moveTaskMutation.mutate({ id: task.id, data: moveData });
  };

  const handleEditTask = (task: TaskWithPriority) => {
    setSelectedTask(task);
    setTaskFormData({
      title: task.title,
      description: task.description || '',
      classification: task.classification,
      idealDate: task.idealDate || '',
      responsible: task.responsible || '',
    });
    setEditDialogOpen(true);
  };

  const handleDeleteTask = (task: TaskWithPriority) => {
    setSelectedTask(task);
    setDeleteDialogOpen(true);
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

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Carregando autenticação...</p>
        </div>
      </Layout>
    );
  }

  if (prioritiesLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Carregando prioridades...</p>
        </div>
      </Layout>
    );
  }

  if (tasksLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Carregando tarefas...</p>
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
            <Button onClick={() => window.location.reload()}>Recarregar página</Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!token) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md">
            <p className="text-muted-foreground mb-4">Você precisa estar autenticado para ver suas tarefas.</p>
            <Button onClick={() => window.location.href = '/login'}>Fazer Login</Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (priorities.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md">
            <p className="text-muted-foreground mb-4">Você ainda não tem prioridades criadas.</p>
            <p className="text-sm text-muted-foreground mb-4">
              Crie uma prioridade primeiro para poder gerenciar suas tarefas.
            </p>
            <Button onClick={() => window.location.href = '/priorities'}>
              Ir para Prioridades
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
            <h1 className="text-2xl font-bold">Gestão de Tarefas</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Visualize e gerencie todas as suas tarefas em um só lugar
            </p>
          </div>
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) {
                setTaskFormData({
                  title: '',
                  description: '',
                  classification: TaskClassification.DO,
                  idealDate: '',
                  responsible: '',
                });
                setSelectedPriorityId('');
              }
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm">Nova Tarefa</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Tarefa</DialogTitle>
                <DialogDescription>
                  Preencha os dados da nova tarefa
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Prioridade *</label>
                  <Select
                    value={selectedPriorityId}
                    onValueChange={setSelectedPriorityId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority.id} value={priority.id}>
                          {priority.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Título *</label>
                  <Input
                    placeholder="Digite o título..."
                    value={taskFormData.title}
                    onChange={(e) =>
                      setTaskFormData({ ...taskFormData, title: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Descrição (opcional)
                  </label>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Descrição..."
                    value={taskFormData.description}
                    onChange={(e) =>
                      setTaskFormData({ ...taskFormData, description: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Classificação *</label>
                  <Select
                    value={taskFormData.classification}
                    onValueChange={(value) =>
                      setTaskFormData({
                        ...taskFormData,
                        classification: value as TaskClassification,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TaskClassification.DO}>Fazer</SelectItem>
                      <SelectItem value={TaskClassification.SCHEDULE}>
                        Agendar
                      </SelectItem>
                      <SelectItem value={TaskClassification.DELEGATE}>
                        Delegar
                      </SelectItem>
                      <SelectItem value={TaskClassification.ELIMINATE}>
                        Eliminar
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {taskFormData.classification === TaskClassification.SCHEDULE && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Data Ideal *</label>
                    <Input
                      type="date"
                      value={taskFormData.idealDate}
                      onChange={(e) =>
                        setTaskFormData({ ...taskFormData, idealDate: e.target.value })
                      }
                    />
                  </div>
                )}
                {taskFormData.classification === TaskClassification.DELEGATE && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Responsável *</label>
                    <Input
                      placeholder="Nome do responsável..."
                      value={taskFormData.responsible}
                      onChange={(e) =>
                        setTaskFormData({ ...taskFormData, responsible: e.target.value })
                      }
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    setTaskFormData({
                      title: '',
                      description: '',
                      classification: TaskClassification.DO,
                      idealDate: '',
                      responsible: '',
                    });
                    setSelectedPriorityId('');
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    if (!taskFormData.title.trim()) {
                      alert('Por favor, preencha o título da tarefa');
                      return;
                    }
                    if (!selectedPriorityId) {
                      alert('Por favor, selecione uma prioridade');
                      return;
                    }
                    if (
                      taskFormData.classification === TaskClassification.SCHEDULE &&
                      !taskFormData.idealDate
                    ) {
                      alert('Por favor, preencha a data ideal para tarefas agendadas');
                      return;
                    }
                    if (
                      taskFormData.classification === TaskClassification.DELEGATE &&
                      !taskFormData.responsible
                    ) {
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
                  {createTaskMutation.isPending ? 'Criando...' : 'Criar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-4 flex flex-wrap gap-4 flex-shrink-0 p-4 bg-muted/50 rounded-lg">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-2 block">Buscar</label>
            <Input
              placeholder="Buscar por título ou descrição..."
              value={filters.searchText}
              onChange={(e) =>
                setFilters({ ...filters, searchText: e.target.value })
              }
            />
          </div>
          <div className="min-w-[200px]">
            <label className="text-sm font-medium mb-2 block">Prioridade</label>
            <Select
              value={filters.priorityId}
              onValueChange={(value) =>
                setFilters({ ...filters, priorityId: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Prioridades</SelectItem>
                {priorities.map((priority) => (
                  <SelectItem key={priority.id} value={priority.id}>
                    {priority.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-[200px]">
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select
              value={
                filters.status.length === 0
                  ? 'all'
                  : filters.status.length === 1
                  ? filters.status[0]
                  : 'custom'
              }
              onValueChange={(value) => {
                if (value === 'all') {
                  setFilters({ ...filters, status: [] });
                } else if (value === 'open-in-progress') {
                  setFilters({
                    ...filters,
                    status: [TaskStatus.OPEN, TaskStatus.IN_PROGRESS],
                  });
                } else {
                  setFilters({ ...filters, status: [value as TaskStatus] });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="open-in-progress">Abertas e Em Progresso</SelectItem>
                <SelectItem value={TaskStatus.OPEN}>Abertas</SelectItem>
                <SelectItem value={TaskStatus.IN_PROGRESS}>Em Progresso</SelectItem>
                <SelectItem value={TaskStatus.COMPLETED}>Concluídas</SelectItem>
                <SelectItem value={TaskStatus.CANCELLED}>Canceladas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-4 gap-4">
              {Object.values(TaskClassification).map((classification) => {
                const tasks = getTasksByClassification(classification);
                const label = classificationLabels[classification];

                return (
                  <Card key={classification} className="min-h-[500px]">
                    <CardHeader>
                      <CardTitle className="text-lg">{label.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{label.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {tasks.length} tarefa{tasks.length !== 1 ? 's' : ''}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <Droppable droppableId={classification}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`space-y-2 min-h-[400px] ${
                              snapshot.isDraggingOver ? 'bg-accent/50 rounded' : ''
                            }`}
                          >
                            {tasks.length === 0 ? (
                              <p className="text-sm text-muted-foreground text-center py-8">
                                Nenhuma tarefa nesta classificação
                              </p>
                            ) : (
                              tasks.map((task, index) => (
                                <Draggable
                                  key={task.id}
                                  draggableId={task.id}
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <Card
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`cursor-move hover:shadow-md transition-shadow ${
                                        snapshot.isDragging ? 'opacity-50' : ''
                                      }`}
                                    >
                                      <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1">
                                            <h3 className="font-medium mb-1">{task.title}</h3>
                                            {task.description && (
                                              <p className="text-xs text-muted-foreground mb-2">
                                                {task.description}
                                              </p>
                                            )}
                                            <div className="space-y-1">
                                              <p className="text-xs text-muted-foreground">
                                                <span className="font-medium">Prioridade:</span>{' '}
                                                {task.priorityTitle}
                                              </p>
                                              {task.idealDate && (
                                                <p className="text-xs text-muted-foreground">
                                                  <span className="font-medium">Data:</span>{' '}
                                                  {new Date(task.idealDate).toLocaleDateString(
                                                    'pt-BR'
                                                  )}
                                                </p>
                                              )}
                                              {task.responsible && (
                                                <p className="text-xs text-muted-foreground">
                                                  <span className="font-medium">Responsável:</span>{' '}
                                                  {task.responsible}
                                                </p>
                                              )}
                                            </div>
                                            <span
                                              className={`text-xs px-2 py-1 rounded mt-2 inline-block ${getTaskStatusColor(
                                                task.status
                                              )}`}
                                            >
                                              {getTaskStatusLabel(task.status)}
                                            </span>
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
                                              {task.status === TaskStatus.OPEN ||
                                              task.status === TaskStatus.IN_PROGRESS ? (
                                                <DropdownMenuItem
                                                  onClick={() =>
                                                    completeTaskMutation.mutate(task.id)
                                                  }
                                                >
                                                  Completar
                                                </DropdownMenuItem>
                                              ) : null}
                                              {task.status === TaskStatus.IN_PROGRESS ? (
                                                <DropdownMenuItem
                                                  onClick={() =>
                                                    cancelTaskMutation.mutate(task.id)
                                                  }
                                                >
                                                  Cancelar
                                                </DropdownMenuItem>
                                              ) : null}
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
                                  )}
                                </Draggable>
                              ))
                            )}
                            {provided.placeholder}
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

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Tarefa</DialogTitle>
              <DialogDescription>
                Edite os dados da tarefa
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Título *</label>
                <Input
                  placeholder="Digite o título..."
                  value={taskFormData.title}
                  onChange={(e) =>
                    setTaskFormData({ ...taskFormData, title: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Descrição (opcional)
                </label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Descrição..."
                  value={taskFormData.description}
                  onChange={(e) =>
                    setTaskFormData({ ...taskFormData, description: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Classificação *</label>
                <Select
                  value={taskFormData.classification}
                  onValueChange={(value) =>
                    setTaskFormData({
                      ...taskFormData,
                      classification: value as TaskClassification,
                    })
                  }
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
                    onChange={(e) =>
                      setTaskFormData({ ...taskFormData, idealDate: e.target.value })
                    }
                  />
                </div>
              )}
              {taskFormData.classification === TaskClassification.DELEGATE && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Responsável *</label>
                  <Input
                    placeholder="Nome do responsável..."
                    value={taskFormData.responsible}
                    onChange={(e) =>
                      setTaskFormData({ ...taskFormData, responsible: e.target.value })
                    }
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setEditDialogOpen(false);
                  setSelectedTask(null);
                  setTaskFormData({
                    title: '',
                    description: '',
                    classification: TaskClassification.DO,
                    idealDate: '',
                    responsible: '',
                  });
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  if (!taskFormData.title.trim()) {
                    alert('Por favor, preencha o título da tarefa');
                    return;
                  }
                  if (
                    taskFormData.classification === TaskClassification.SCHEDULE &&
                    !taskFormData.idealDate
                  ) {
                    alert('Por favor, preencha a data ideal para tarefas agendadas');
                    return;
                  }
                  if (
                    taskFormData.classification === TaskClassification.DELEGATE &&
                    !taskFormData.responsible
                  ) {
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

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir a tarefa "{selectedTask?.title}"? Esta ação
                não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setSelectedTask(null);
                }}
              >
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

        <Dialog
          open={moveTaskDialogOpen}
          onOpenChange={(open) => {
            setMoveTaskDialogOpen(open);
            if (!open) {
              setPendingMove(null);
              setMoveTaskFormData({ idealDate: '', responsible: '' });
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mover Tarefa</DialogTitle>
              <DialogDescription>
                {pendingMove?.targetClassification === TaskClassification.SCHEDULE
                  ? 'Informe a data ideal para agendar esta tarefa'
                  : 'Informe o responsável para delegar esta tarefa'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {pendingMove?.targetClassification === TaskClassification.SCHEDULE && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Data Ideal *</label>
                  <Input
                    type="date"
                    value={moveTaskFormData.idealDate}
                    onChange={(e) =>
                      setMoveTaskFormData({ ...moveTaskFormData, idealDate: e.target.value })
                    }
                  />
                </div>
              )}
              {pendingMove?.targetClassification === TaskClassification.DELEGATE && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Responsável *</label>
                  <Input
                    placeholder="Nome do responsável..."
                    value={moveTaskFormData.responsible}
                    onChange={(e) =>
                      setMoveTaskFormData({ ...moveTaskFormData, responsible: e.target.value })
                    }
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setMoveTaskDialogOpen(false);
                  setPendingMove(null);
                  setMoveTaskFormData({ idealDate: '', responsible: '' });
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  if (!pendingMove) return;

                  if (
                    pendingMove.targetClassification === TaskClassification.SCHEDULE &&
                    !moveTaskFormData.idealDate
                  ) {
                    alert('Por favor, preencha a data ideal');
                    return;
                  }

                  if (
                    pendingMove.targetClassification === TaskClassification.DELEGATE &&
                    !moveTaskFormData.responsible
                  ) {
                    alert('Por favor, preencha o responsável');
                    return;
                  }

                  const moveData: MoveTaskDto = {
                    classification: pendingMove.targetClassification,
                    idealDate: moveTaskFormData.idealDate || undefined,
                    responsible: moveTaskFormData.responsible || undefined,
                  };

                  moveTaskMutation.mutate({ id: pendingMove.task.id, data: moveData });
                }}
                disabled={moveTaskMutation.isPending}
              >
                {moveTaskMutation.isPending ? 'Movendo...' : 'Mover'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

