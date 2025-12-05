import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { EisenhowerQuadrant, PriorityResponseDto, CreatePriorityDto, PriorityOrigin } from '@/types/priority.types';
import { priorityService } from '@/services/priority.service';
import { useAuth } from '@/contexts/AuthContext';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedQuadrant, setSelectedQuadrant] = useState<EisenhowerQuadrant | null>(null);
  const [editingPriority, setEditingPriority] = useState<PriorityResponseDto | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formTags, setFormTags] = useState('');

  const { data: priorities = [], isLoading, error } = useQuery({
    queryKey: ['priorities'],
    queryFn: () => priorityService.getAll(token),
    enabled: !!token,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePriorityDto) => priorityService.create(token, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['priorities'] });
      setDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePriorityDto> }) =>
      priorityService.update(token, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['priorities'] });
      setDialogOpen(false);
      resetForm();
      setEditingPriority(null);
    },
  });

  const moveMutation = useMutation({
    mutationFn: ({ id, quadrant }: { id: string; quadrant: EisenhowerQuadrant }) =>
      priorityService.move(token, id, { quadrant }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['priorities'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => priorityService.delete(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['priorities'] });
    },
  });

  const resetForm = () => {
    setFormTitle('');
    setFormDescription('');
    setFormTags('');
    setSelectedQuadrant(null);
    setEditingPriority(null);
  };

  const handleOpenCreateDialog = (quadrant: EisenhowerQuadrant) => {
    setSelectedQuadrant(quadrant);
    setEditingPriority(null);
    resetForm();
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (priority: PriorityResponseDto) => {
    setEditingPriority(priority);
    setSelectedQuadrant(priority.quadrant);
    setFormTitle(priority.title);
    setFormDescription(priority.description || '');
    setFormTags(priority.tags.join(', '));
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formTitle.trim() || !selectedQuadrant) return;

    const tagsArray = formTags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    if (editingPriority) {
      updateMutation.mutate({
        id: editingPriority.id,
        data: {
          title: formTitle,
          description: formDescription || undefined,
          tags: tagsArray.length > 0 ? tagsArray : undefined,
        },
      });
    } else {
      createMutation.mutate({
        title: formTitle,
        description: formDescription || undefined,
        quadrant: selectedQuadrant,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
        origin: PriorityOrigin.MANUAL,
      });
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceQuadrant = result.source.droppableId as EisenhowerQuadrant;
    const destQuadrant = result.destination.droppableId as EisenhowerQuadrant;
    const priorityId = result.draggableId;

    if (sourceQuadrant !== destQuadrant) {
      moveMutation.mutate({ id: priorityId, quadrant: destQuadrant });
    }
  };

  const getPrioritiesByQuadrant = (quadrant: EisenhowerQuadrant) => {
    return priorities
      .filter((p) => p.quadrant === quadrant)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loading />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
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
              <DialogTitle>
                {editingPriority ? 'Editar Prioridade' : 'Criar Nova Prioridade'}
              </DialogTitle>
              <DialogDescription>
                {editingPriority
                  ? 'Atualize os dados da prioridade'
                  : 'Preencha os dados da nova prioridade'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Título *</label>
                <Input
                  placeholder="Digite o título..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Descrição (opcional)
                </label>
                <Input
                  placeholder="Descrição..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Tags (separadas por vírgula)
                </label>
                <Input
                  placeholder="Ex: trabalho, urgente"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                />
              </div>
              {!editingPriority && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Quadrante *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.values(EisenhowerQuadrant).map((quadrant) => (
                      <Button
                        key={quadrant}
                        type="button"
                        variant={selectedQuadrant === quadrant ? 'default' : 'outline'}
                        onClick={() => setSelectedQuadrant(quadrant)}
                        className="text-xs"
                      >
                        {quadrantLabels[quadrant].title}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  !formTitle.trim() ||
                  (!editingPriority && !selectedQuadrant) ||
                  createMutation.isPending ||
                  updateMutation.isPending
                }
              >
                {editingPriority ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-2 gap-4">
          {Object.values(EisenhowerQuadrant).map((quadrant) => {
            const quadrantPriorities = getPrioritiesByQuadrant(quadrant);
            const label = quadrantLabels[quadrant];

            return (
              <Card key={quadrant} className="min-h-[400px]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{label.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {label.description}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenCreateDialog(quadrant)}
                    >
                      + Adicionar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Droppable droppableId={quadrant}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`min-h-[300px] space-y-2 ${
                          snapshot.isDraggingOver ? 'bg-accent/50 rounded-md p-2' : ''
                        }`}
                      >
                        {quadrantPriorities.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-8">
                            Nenhuma prioridade neste quadrante
                          </p>
                        ) : (
                          quadrantPriorities.map((priority, index) => (
                            <Draggable
                              key={priority.id}
                              draggableId={priority.id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`cursor-move hover:shadow-md transition-shadow ${
                                    snapshot.isDragging
                                      ? 'shadow-lg border-primary bg-primary/5'
                                      : ''
                                  }`}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                      <div
                                        className="flex-1 cursor-pointer"
                                        onClick={() => navigate(`/priorities/${priority.id}/tasks`)}
                                      >
                                        <h3 className="font-medium mb-1">
                                          {priority.title}
                                        </h3>
                                        {priority.description && (
                                          <p className="text-sm text-muted-foreground mb-2">
                                            {priority.description}
                                          </p>
                                        )}
                                        {priority.tags.length > 0 && (
                                          <div className="flex gap-2 flex-wrap mb-2">
                                            {priority.tags.map((tag) => (
                                              <span
                                                key={tag}
                                                className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded"
                                              >
                                                {tag}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                          <span>
                                            {priority.taskCount || 0} tarefa
                                            {priority.taskCount !== 1 ? 's' : ''}
                                          </span>
                                          <span className="capitalize">
                                            {priority.origin}
                                          </span>
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
                                          <DropdownMenuItem
                                            onClick={() => handleOpenEditDialog(priority)}
                                          >
                                            Editar
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={() => deleteMutation.mutate(priority.id)}
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
    </Layout>
  );
};
