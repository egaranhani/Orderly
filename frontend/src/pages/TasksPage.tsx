import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TaskClassification } from '@/types/task.types';
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
  const [dialogOpen, setDialogOpen] = useState(false);

  const mockTasks = [
    {
      id: '1',
      title: 'Revisar orçamento com financeiro',
      classification: TaskClassification.SCHEDULE,
      idealDate: '2024-01-15',
      status: 'open' as const,
    },
    {
      id: '2',
      title: 'Preparar apresentação',
      classification: TaskClassification.DO,
      status: 'in_progress' as const,
    },
    {
      id: '3',
      title: 'Enviar email para cliente',
      classification: TaskClassification.DELEGATE,
      responsible: 'João',
      status: 'open' as const,
    },
  ];

  const getTasksByClassification = (classification: TaskClassification) => {
    return mockTasks.filter((t) => t.classification === classification);
  };

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tarefas</h1>
          <p className="text-muted-foreground mt-1">
            Prioridade: Fechar proposta da Congregação
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
                <label className="text-sm font-medium mb-2 block">Título</label>
                <Input placeholder="Digite o título..." />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Descrição (opcional)
                </label>
                <Input placeholder="Descrição..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setDialogOpen(false)}>Criar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

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
                <div className="space-y-2">
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
                              <h3 className="font-medium mb-1">{task.title}</h3>
                              {task.idealDate && (
                                <p className="text-xs text-muted-foreground">
                                  Data: {task.idealDate}
                                </p>
                              )}
                              {task.responsible && (
                                <p className="text-xs text-muted-foreground">
                                  Responsável: {task.responsible}
                                </p>
                              )}
                              <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded mt-2 inline-block capitalize">
                                {task.status}
                              </span>
                            </div>
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
    </Layout>
  );
};
