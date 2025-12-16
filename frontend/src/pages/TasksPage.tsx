import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
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

export const TasksPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token, isLoading: authLoading, error: authError } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskResponseDto | null>(null);
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    classification: TaskClassification.DO,
    idealDate: '',
    responsible: '',
  });

  const { data: priority, isLoading: priorityLoading } = useQuery({
    queryKey: ['priority', id],
    queryFn: () => priorityService.getById(token!, id!),
    enabled: !!id && !!token && !authLoading,
  });

  const { data: tasks = [], isLoading: tasksLoading, error: tasksError } = useQuery({
    queryKey: ['tasks', id],
    queryFn: () => priorityService.getTasks(token!, id!),
    enabled: !!id && !!token && !authLoading,
  });

  const getTasksByClassification = (classification: TaskClassification) => {
    return tasks.filter((t) => t.classification === classification);
  };

  const createTaskMutation = useMutation({
    mutationFn: (data: CreateTaskDto) => {
      if (!id) throw new Error('ID da prioridade não encontrado');
      return taskService.create(token!, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', id] });
      queryClient.invalidateQueries({ queryKey: ['priorities'] });
      setDialogOpen(false);
      setTaskFormData({ title: '', description: '', classification: TaskClassification.DO, idealDate: '', responsible: '' });
    },
    onError: (error: any) => {
      console.error('Erro ao criar tarefa:', error);
      alert('Erro ao criar tarefa. Verifique o console para mais detalhes.');
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id: taskId, data }: { id: string; data: UpdateTaskDto }) =>
      taskService.update(token!, taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', id] });
      queryClient.invalidateQueries({ queryKey: ['priorities'] });
      setEditDialogOpen(false);
      setSelectedTask(null);
      setTaskFormData({ title: '', description: '', classification: TaskClassification.DO, idealDate: '', responsible: '' });
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar tarefa:', error);
      alert('Erro ao atualizar tarefa. Verifique o console para mais detalhes.');
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => taskService.delete(token!, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', id] });
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
      queryClient.invalidateQueries({ queryKey: ['tasks', id] });
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
      queryClient.invalidateQueries({ queryKey: ['tasks', id] });
      queryClient.invalidateQueries({ queryKey: ['priorities'] });
    },
    onError: (error: any) => {
      console.error('Erro ao cancelar tarefa:', error);
      alert('Erro ao cancelar tarefa. Verifique o console para mais detalhes.');
    },
  });

  const moveTaskMutation = useMutation({
    mutationFn: ({ id: taskId, data }: { id: string; data: MoveTaskDto }) =>
      taskService.move(token!, taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', id] });
      queryClient.invalidateQueries({ queryKey: ['priorities'] });
    },
    onError: (error: any) => {
      console.error('Erro ao mover tarefa:', error);
      alert('Erro ao mover tarefa. Verifique o console para mais detalhes.');
    },
  });

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceClassification = result.source.droppableId as TaskClassification;
    const destClassification = result.destination.droppableId as TaskClassification;

    if (sourceClassification === destClassification) return;

    const task = tasks.find((t) => t.id === result.draggableId);
    if (!task) return;

    const moveData: MoveTaskDto = {
      classification: destClassification,
    };

    if (destClassification === TaskClassification.SCHEDULE) {
      const idealDate = prompt('Digite a data ideal (YYYY-MM-DD):');
      if (!idealDate) return;
      moveData.idealDate = idealDate;
    }

    if (destClassification === TaskClassification.DELEGATE) {
      const responsible = prompt('Digite o nome do responsável:');
      if (!responsible) return;
      moveData.responsible = responsible;
    }

    moveTaskMutation.mutate({ id: task.id, data: moveData });
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
    setEditDialogOpen(true);
  };

  const handleDeleteTask = (task: TaskResponseDto) => {
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

  if (priorityLoading || tasksLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Carregando tarefas...</p>
        </div>
      </Layout>
    );
  }

  if (!priority) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Prioridade não encontrada</p>
        </div>
      </Layout>
    );
  }

  if (tasksError) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p className="text-destructive">Erro ao carregar tarefas. Tente novamente mais tarde.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tarefas</h1>
          <p className="text-muted-foreground mt-1">
            Prioridade: {priority.title}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Nova Tarefa</Button>
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
                <label className="text-sm font-medium mb-2 block">Título *</label>
                <Input
                  placeholder="Digite o título..."
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
                  placeholder="Descrição..."
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
                setDialogOpen(false);
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
                {createTaskMutation.isPending ? 'Criando...' : 'Criar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-4 gap-4">
          {Object.values(TaskClassification).map((classification) => {
            const tasks = getTasksByClassification(classification);
            const label = classificationLabels[classification];

            return (
              <Card key={classification} className="min-h-[500px]">
                <CardHeader>
                  <CardTitle className="text-lg">{label.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {label.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <Droppable droppableId={classification}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-2 min-h-[400px] ${snapshot.isDraggingOver ? 'bg-accent/50 rounded' : ''}`}
                      >
                        {tasks.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-8">
                            Nenhuma tarefa nesta classificação
                          </p>
                        ) : (
                          tasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided, snapshot) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`cursor-move hover:shadow-md transition-shadow ${snapshot.isDragging ? 'opacity-50' : ''}`}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <h3 className="font-medium mb-1">{task.title}</h3>
                                        {task.description && (
                                          <p className="text-xs text-muted-foreground mb-1">{task.description}</p>
                                        )}
                                        {task.idealDate && (
                                          <p className="text-xs text-muted-foreground">
                                            Data: {new Date(task.idealDate).toLocaleDateString('pt-BR')}
                                          </p>
                                        )}
                                        {task.responsible && (
                                          <p className="text-xs text-muted-foreground">
                                            Responsável: {task.responsible}
                                          </p>
                                        )}
                                        <span className={`text-xs px-2 py-1 rounded mt-2 inline-block ${getTaskStatusColor(task.status)}`}>
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
                                          {task.status === TaskStatus.OPEN || task.status === TaskStatus.IN_PROGRESS ? (
                                            <DropdownMenuItem onClick={() => completeTaskMutation.mutate(task.id)}>
                                              Completar
                                            </DropdownMenuItem>
                                          ) : null}
                                          {task.status === TaskStatus.IN_PROGRESS ? (
                                            <DropdownMenuItem onClick={() => cancelTaskMutation.mutate(task.id)}>
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

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tarefa</DialogTitle>
            <DialogDescription>
              Editar tarefa da prioridade "{priority.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Título *</label>
              <Input
                placeholder="Digite o título..."
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
                placeholder="Descrição..."
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
              setEditDialogOpen(false);
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a tarefa "{selectedTask?.title}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setDeleteDialogOpen(false);
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
    </Layout>
  );
};
