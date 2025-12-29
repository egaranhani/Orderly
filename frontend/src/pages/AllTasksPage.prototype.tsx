import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { TaskClassification, TaskStatus } from '@/types/task.types';

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

// Dados mockados para o protótipo
const mockTasks = [
  {
    id: '1',
    title: 'Revisar proposta do cliente',
    description: 'Analisar e responder proposta recebida por email',
    classification: TaskClassification.DO,
    status: TaskStatus.OPEN,
    priorityTitle: 'Prioridade Urgente e Importante',
    idealDate: null,
    responsible: null,
  },
  {
    id: '2',
    title: 'Preparar apresentação',
    description: 'Criar slides para reunião de equipe',
    classification: TaskClassification.DO,
    status: TaskStatus.IN_PROGRESS,
    priorityTitle: 'Prioridade Não Urgente mas Importante',
    idealDate: null,
    responsible: null,
  },
  {
    id: '3',
    title: 'Reunião com fornecedor',
    description: 'Discutir novos contratos',
    classification: TaskClassification.SCHEDULE,
    status: TaskStatus.OPEN,
    priorityTitle: 'Prioridade Urgente e Importante',
    idealDate: '2024-01-15',
    responsible: null,
  },
  {
    id: '4',
    title: 'Atualizar documentação',
    description: 'Revisar e atualizar docs do projeto',
    classification: TaskClassification.SCHEDULE,
    status: TaskStatus.OPEN,
    priorityTitle: 'Prioridade Não Urgente mas Importante',
    idealDate: '2024-01-20',
    responsible: null,
  },
  {
    id: '5',
    title: 'Revisar relatório mensal',
    description: 'Delegar para assistente',
    classification: TaskClassification.DELEGATE,
    status: TaskStatus.OPEN,
    priorityTitle: 'Prioridade Urgente mas Não Importante',
    idealDate: null,
    responsible: 'João Silva',
  },
  {
    id: '6',
    title: 'Organizar arquivos antigos',
    description: 'Arquivos que podem ser descartados',
    classification: TaskClassification.ELIMINATE,
    status: TaskStatus.OPEN,
    priorityTitle: 'Prioridade Não Urgente e Não Importante',
    idealDate: null,
    responsible: null,
  },
];

const mockPriorities = [
  'Todas as Prioridades',
  'Prioridade Urgente e Importante',
  'Prioridade Não Urgente mas Importante',
  'Prioridade Urgente mas Não Importante',
  'Prioridade Não Urgente e Não Importante',
];

export const AllTasksPagePrototype: React.FC = () => {
  const [selectedPriority, setSelectedPriority] = useState('Todas as Prioridades');
  const [selectedClassifications, setSelectedClassifications] = useState<string[]>([
    TaskClassification.DO,
    TaskClassification.SCHEDULE,
    TaskClassification.DELEGATE,
    TaskClassification.ELIMINATE,
  ]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([
    TaskStatus.OPEN,
    TaskStatus.IN_PROGRESS,
  ]);
  const [searchText, setSearchText] = useState('');

  const getTasksByClassification = (classification: TaskClassification) => {
    return mockTasks.filter((t) => {
      const matchesClassification = t.classification === classification;
      const matchesPriority =
        selectedPriority === 'Todas as Prioridades' ||
        t.priorityTitle === selectedPriority;
      const matchesStatus = selectedStatuses.includes(t.status);
      const matchesSearch =
        !searchText ||
        t.title.toLowerCase().includes(searchText.toLowerCase()) ||
        (t.description &&
          t.description.toLowerCase().includes(searchText.toLowerCase()));

      return (
        matchesClassification &&
        matchesPriority &&
        matchesStatus &&
        matchesSearch
      );
    });
  };

  return (
    <Layout>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-2xl font-bold">Gestão de Tarefas</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Visualize e gerencie todas as suas tarefas em um só lugar
            </p>
          </div>
          <Dialog>
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
                  <label className="text-sm font-medium mb-2 block">
                    Prioridade *
                  </label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockPriorities
                        .filter((p) => p !== 'Todas as Prioridades')
                        .map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {priority}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Título *
                  </label>
                  <Input placeholder="Digite o título..." />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Descrição (opcional)
                  </label>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Descrição..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Classificação *
                  </label>
                  <Select>
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
              </div>
              <DialogFooter>
                <Button variant="outline">Cancelar</Button>
                <Button>Criar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtros */}
        <div className="mb-4 flex flex-wrap gap-4 flex-shrink-0 p-4 bg-muted/50 rounded-lg">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-2 block">Buscar</label>
            <Input
              placeholder="Buscar por título ou descrição..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <div className="min-w-[200px]">
            <label className="text-sm font-medium mb-2 block">Prioridade</label>
            <Select
              value={selectedPriority}
              onValueChange={setSelectedPriority}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mockPriorities.map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {priority}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-[200px]">
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select
              value={selectedStatuses.join(',')}
              onValueChange={(value) => setSelectedStatuses(value.split(','))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={[TaskStatus.OPEN, TaskStatus.IN_PROGRESS].join(',')}>
                  Abertas e Em Progresso
                </SelectItem>
                <SelectItem value={TaskStatus.OPEN}>Abertas</SelectItem>
                <SelectItem value={TaskStatus.IN_PROGRESS}>
                  Em Progresso
                </SelectItem>
                <SelectItem value={TaskStatus.COMPLETED}>Concluídas</SelectItem>
                <SelectItem value={TaskStatus.CANCELLED}>Canceladas</SelectItem>
                <SelectItem
                  value={[
                    TaskStatus.OPEN,
                    TaskStatus.IN_PROGRESS,
                    TaskStatus.COMPLETED,
                    TaskStatus.CANCELLED,
                  ].join(',')}
                >
                  Todas
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Grid de Tarefas */}
        <div className="flex-1 overflow-auto">
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
                    <p className="text-xs text-muted-foreground mt-1">
                      {tasks.length} tarefa{tasks.length !== 1 ? 's' : ''}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 min-h-[400px]">
                      {tasks.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          Nenhuma tarefa nesta classificação
                        </p>
                      ) : (
                        tasks.map((task) => (
                          <Card
                            key={task.id}
                            className="cursor-move hover:shadow-md transition-shadow"
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className="font-medium mb-1">
                                    {task.title}
                                  </h3>
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
                                    <DropdownMenuItem>Editar</DropdownMenuItem>
                                    {task.status === TaskStatus.OPEN ||
                                    task.status === TaskStatus.IN_PROGRESS ? (
                                      <DropdownMenuItem>Completar</DropdownMenuItem>
                                    ) : null}
                                    {task.status === TaskStatus.IN_PROGRESS ? (
                                      <DropdownMenuItem>Cancelar</DropdownMenuItem>
                                    ) : null}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive">
                                      Deletar
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
};

