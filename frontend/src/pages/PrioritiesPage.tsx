import React, { useState } from 'react';
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
  const [selectedQuadrant, setSelectedQuadrant] = useState<EisenhowerQuadrant | null>(null);

  const mockPriorities = [
    {
      id: '1',
      title: 'Fechar proposta da Congregação',
      tags: ['trabalho', 'urgente'],
      taskCount: 3,
      quadrant: EisenhowerQuadrant.Q1,
      origin: 'manual' as const,
    },
    {
      id: '2',
      title: 'Planejar férias de julho',
      tags: ['pessoal', 'família'],
      taskCount: 0,
      quadrant: EisenhowerQuadrant.Q2,
      origin: 'manual' as const,
    },
  ];

  const getPrioritiesByQuadrant = (quadrant: EisenhowerQuadrant) => {
    return mockPriorities.filter((p) => p.quadrant === quadrant);
  };

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Matriz de Prioridades</h1>
          <p className="text-muted-foreground mt-1">
            Organize suas prioridades usando a Matriz de Eisenhower
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Nova Prioridade</Button>
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

      <div className="grid grid-cols-2 gap-4">
        {Object.values(EisenhowerQuadrant).map((quadrant) => {
          const priorities = getPrioritiesByQuadrant(quadrant);
          const label = quadrantLabels[quadrant];

          return (
            <Card key={quadrant} className="min-h-[400px]">
              <CardHeader>
                <CardTitle className="text-lg">{label.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {label.description}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {priorities.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Nenhuma prioridade neste quadrante
                    </p>
                  ) : (
                    priorities.map((priority) => (
                      <Card
                        key={priority.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium mb-1">
                                {priority.title}
                              </h3>
                              <div className="flex gap-2 flex-wrap">
                                {priority.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span>
                                  {priority.taskCount} tarefa
                                  {priority.taskCount !== 1 ? 's' : ''}
                                </span>
                                <span className="capitalize">
                                  {priority.origin}
                                </span>
                              </div>
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
