import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { inboxService } from '@/services/inbox.service';
import { priorityService } from '@/services/priority.service';
import { InboxSuggestionCard } from '@/components/InboxSuggestionCard';
import { InboxHistoryItem } from '@/components/InboxHistoryItem';
import {
  ActionSuggestionDto,
  InboxItemResponseDto,
  InboxItemStatus,
  AcceptSuggestionDto,
  DiscardSuggestionDto,
  ProcessInboxDto,
} from '@/types/inbox.types';
import {
  EisenhowerQuadrant,
  PriorityResponseDto,
} from '@/types/priority.types';
import { TaskClassification } from '@/types/task.types';

const quadrantLabels = {
  [EisenhowerQuadrant.Q1]: 'Urgente / Importante',
  [EisenhowerQuadrant.Q2]: 'Não Urgente / Importante',
  [EisenhowerQuadrant.Q3]: 'Urgente / Não Importante',
  [EisenhowerQuadrant.Q4]: 'Não Urgente / Não Importante',
};

const classificationLabels = {
  [TaskClassification.DO]: 'Fazer',
  [TaskClassification.SCHEDULE]: 'Agendar',
  [TaskClassification.DELEGATE]: 'Delegar',
  [TaskClassification.ELIMINATE]: 'Eliminar',
};

export const InboxPage: React.FC = () => {
  const { token, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const [meetingContent, setMeetingContent] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [statusFilter, setStatusFilter] = useState<InboxItemStatus | 'all'>('all');
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(
    new Set()
  );
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<ActionSuggestionDto | null>(null);
  const [selectedInboxItemId, setSelectedInboxItemId] = useState<string | null>(
    null
  );
  const [pendingDiscardId, setPendingDiscardId] = useState<string | null>(null);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [selectedHistoryItemId, setSelectedHistoryItemId] = useState<
    string | null
  >(null);

  const [editFormData, setEditFormData] = useState({
    priorityTitle: '',
    priorityQuadrant: EisenhowerQuadrant.Q1,
    priorityTags: [] as string[],
    tagInput: '',
    taskTitle: '',
    taskClassification: TaskClassification.DO,
    taskIdealDate: '',
    taskResponsible: '',
    linkToExistingPriorityId: '',
  });

  const { data: inboxItems = [], isLoading: inboxLoading } = useQuery({
    queryKey: ['inbox-items', statusFilter],
    queryFn: () => {
      const status =
        statusFilter === 'all' ? undefined : (statusFilter as InboxItemStatus);
      return inboxService.getAll(token, status);
    },
    enabled: !!token && !authLoading,
  });

  const { data: priorities = [] } = useQuery({
    queryKey: ['priorities'],
    queryFn: () => priorityService.getAll(token),
    enabled: !!token && !authLoading && linkDialogOpen,
  });

  const processMutation = useMutation({
    mutationFn: (data: ProcessInboxDto) => inboxService.process(token, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox-items'] });
      setMeetingContent('');
      setMeetingTitle('');
      alert('Reunião processada com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao processar reunião:', error);
      alert(
        `Erro ao processar reunião: ${error.response?.data?.message || error.message}`
      );
    },
  });

  const acceptMutation = useMutation({
    mutationFn: ({
      inboxItemId,
      data,
    }: {
      inboxItemId: string;
      data: AcceptSuggestionDto;
    }) => inboxService.acceptSuggestion(token, inboxItemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox-items'] });
      queryClient.invalidateQueries({ queryKey: ['priorities'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['all-tasks'] });
      setEditDialogOpen(false);
      setLinkDialogOpen(false);
      setSelectedSuggestion(null);
      alert('Sugestão aceita com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao aceitar sugestão:', error);
      alert(
        `Erro ao aceitar sugestão: ${error.response?.data?.message || error.message}`
      );
    },
  });

  const discardMutation = useMutation({
    mutationFn: ({
      inboxItemId,
      data,
    }: {
      inboxItemId: string;
      data: DiscardSuggestionDto;
    }) => inboxService.discardSuggestion(token, inboxItemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox-items'] });
      setDiscardDialogOpen(false);
      setPendingDiscardId(null);
      alert('Sugestão descartada com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao descartar sugestão:', error);
      alert(
        `Erro ao descartar sugestão: ${error.response?.data?.message || error.message}`
      );
    },
  });

  const handleProcess = () => {
    if (!meetingContent.trim()) return;
    processMutation.mutate({
      meetingTitle: meetingTitle.trim() || undefined,
      meetingContent: meetingContent.trim(),
    });
  };

  const handleEdit = (suggestion: ActionSuggestionDto, inboxItemId: string) => {
    setSelectedSuggestion(suggestion);
    setSelectedInboxItemId(inboxItemId);
    setEditFormData({
      priorityTitle: suggestion.suggestedPriority.title,
      priorityQuadrant: suggestion.suggestedPriority.quadrant,
      priorityTags: [...suggestion.suggestedPriority.tags],
      tagInput: '',
      taskTitle: suggestion.suggestedTask.title,
      taskClassification: suggestion.suggestedTask.classification,
      taskIdealDate: suggestion.suggestedTask.idealDate || '',
      taskResponsible: suggestion.suggestedTask.responsible || '',
      linkToExistingPriorityId: '',
    });
    setEditDialogOpen(true);
  };

  const handleAccept = (suggestion: ActionSuggestionDto, inboxItemId: string) => {
    if (!selectedInboxItemId) {
      setSelectedInboxItemId(inboxItemId);
    }
    acceptMutation.mutate({
      inboxItemId,
      data: {
        suggestionId: suggestion.id,
      },
    });
  };

  const handleAcceptWithEdits = () => {
    if (!selectedSuggestion || !selectedInboxItemId) return;

    const adjustments: AcceptSuggestionDto['adjustments'] = {
      priority: {
        title: editFormData.priorityTitle,
        quadrant: editFormData.priorityQuadrant,
        tags: editFormData.priorityTags,
      },
      task: {
        title: editFormData.taskTitle,
        classification: editFormData.taskClassification,
        idealDate: editFormData.taskIdealDate || undefined,
        responsible:
          editFormData.taskClassification === TaskClassification.DELEGATE
            ? editFormData.taskResponsible || undefined
            : undefined,
      },
    };

    acceptMutation.mutate({
      inboxItemId: selectedInboxItemId,
      data: {
        suggestionId: selectedSuggestion.id,
        adjustments,
        linkToExistingPriorityId: editFormData.linkToExistingPriorityId || undefined,
      },
    });
  };

  const handleDiscard = (suggestionId: string, inboxItemId: string) => {
    setPendingDiscardId(suggestionId);
    setSelectedInboxItemId(inboxItemId);
    setDiscardDialogOpen(true);
  };

  const confirmDiscard = () => {
    if (!pendingDiscardId || !selectedInboxItemId) return;
    discardMutation.mutate({
      inboxItemId: selectedInboxItemId,
      data: {
        suggestionId: pendingDiscardId,
      },
    });
  };

  const handleSelectSuggestion = (suggestionId: string, selected: boolean) => {
    setSelectedSuggestions((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(suggestionId);
      } else {
        newSet.delete(suggestionId);
      }
      return newSet;
    });
  };

  const handleBatchAccept = () => {
    if (selectedSuggestions.size === 0) return;
    alert('Funcionalidade de aceitar em lote será implementada em breve');
  };

  const handleBatchDiscard = () => {
    if (selectedSuggestions.size === 0) return;
    alert('Funcionalidade de descartar em lote será implementada em breve');
  };

  const handleLinkToPriority = (suggestion: ActionSuggestionDto, inboxItemId: string) => {
    setSelectedSuggestion(suggestion);
    setSelectedInboxItemId(inboxItemId);
    setEditFormData({
      priorityTitle: suggestion.suggestedPriority.title,
      priorityQuadrant: suggestion.suggestedPriority.quadrant,
      priorityTags: [...suggestion.suggestedPriority.tags],
      tagInput: '',
      taskTitle: suggestion.suggestedTask.title,
      taskClassification: suggestion.suggestedTask.classification,
      taskIdealDate: suggestion.suggestedTask.idealDate || '',
      taskResponsible: suggestion.suggestedTask.responsible || '',
      linkToExistingPriorityId: '',
    });
    setLinkDialogOpen(true);
  };

  const handleLinkAccept = () => {
    if (!selectedSuggestion || !selectedInboxItemId || !editFormData.linkToExistingPriorityId) {
      alert('Selecione uma prioridade para vincular');
      return;
    }

    const adjustments: AcceptSuggestionDto['adjustments'] = {
      task: {
        title: editFormData.taskTitle,
        classification: editFormData.taskClassification,
        idealDate: editFormData.taskIdealDate || undefined,
        responsible:
          editFormData.taskClassification === TaskClassification.DELEGATE
            ? editFormData.taskResponsible || undefined
            : undefined,
      },
    };

    acceptMutation.mutate({
      inboxItemId: selectedInboxItemId,
      data: {
        suggestionId: selectedSuggestion.id,
        adjustments,
        linkToExistingPriorityId: editFormData.linkToExistingPriorityId,
      },
    });
  };

  const addTag = () => {
    if (editFormData.tagInput.trim()) {
      setEditFormData({
        ...editFormData,
        priorityTags: [...editFormData.priorityTags, editFormData.tagInput.trim()],
        tagInput: '',
      });
    }
  };

  const removeTag = (tag: string) => {
    setEditFormData({
      ...editFormData,
      priorityTags: editFormData.priorityTags.filter((t) => t !== tag),
    });
  };

  const latestProcessedItem = useMemo(() => {
    return inboxItems
      .filter((item) => item.status === InboxItemStatus.PROCESSED)
      .sort(
        (a, b) =>
          new Date(b.processedAt || b.createdAt).getTime() -
          new Date(a.processedAt || a.createdAt).getTime()
      )[0];
  }, [inboxItems]);

  const pendingSuggestions = useMemo(() => {
    if (!latestProcessedItem) return [];
    return latestProcessedItem.suggestions.filter(
      (s) => !s.id.includes('accepted') && !s.id.includes('discarded')
    );
  }, [latestProcessedItem]);

  const historyItems = useMemo(() => {
    return inboxItems
      .filter((item) => item.status !== InboxItemStatus.PENDING)
      .sort(
        (a, b) =>
          new Date(b.processedAt || b.createdAt).getTime() -
          new Date(a.processedAt || a.createdAt).getTime()
      );
  }, [inboxItems]);

  if (authLoading || inboxLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Inbox</h1>
        <p className="text-muted-foreground mt-1">
          Processe resumos de reuniões e revise sugestões da IA
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Processar Reunião</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Título da Reunião (opcional)
                </label>
                <Input
                  placeholder="Ex: Reunião de Planejamento"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Resumo da Reunião
                </label>
                <Textarea
                  placeholder="Cole ou digite o resumo da reunião aqui..."
                  value={meetingContent}
                  onChange={(e) => setMeetingContent(e.target.value)}
                  className="min-h-[200px]"
                />
              </div>
              <Button
                onClick={handleProcess}
                disabled={!meetingContent.trim() || processMutation.isPending}
                className="w-full"
              >
                {processMutation.isPending ? 'Processando...' : 'Processar com IA'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Histórico</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setHistoryExpanded(!historyExpanded)}
                >
                  {historyExpanded ? 'Ocultar' : 'Mostrar'}
                </Button>
              </div>
            </CardHeader>
            {historyExpanded && (
              <CardContent>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {historyItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhuma reunião processada ainda
                    </p>
                  ) : (
                    historyItems.map((item) => (
                      <InboxHistoryItem
                        key={item.id}
                        item={item}
                        onSelect={setSelectedHistoryItemId}
                        isExpanded={selectedHistoryItemId === item.id}
                      />
                    ))
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Sugestões Processadas</h2>
              <p className="text-sm text-muted-foreground">
                {pendingSuggestions.length} sugestão(ões) disponível(is)
              </p>
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as InboxItemStatus | 'all')
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value={InboxItemStatus.PENDING}>Pendentes</SelectItem>
                <SelectItem value={InboxItemStatus.PROCESSED}>
                  Processadas
                </SelectItem>
                <SelectItem value={InboxItemStatus.ACCEPTED}>Aceitas</SelectItem>
                <SelectItem value={InboxItemStatus.DISCARDED}>
                  Descartadas
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedSuggestions.size > 0 && (
            <div className="mb-4 flex gap-2">
              <Button
                size="sm"
                onClick={handleBatchAccept}
                variant="outline"
              >
                Aceitar Selecionadas ({selectedSuggestions.size})
              </Button>
              <Button
                size="sm"
                onClick={handleBatchDiscard}
                variant="destructive"
              >
                Descartar Selecionadas ({selectedSuggestions.size})
              </Button>
            </div>
          )}

          <div className="space-y-4">
            {pendingSuggestions.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">
                    {latestProcessedItem
                      ? 'Nenhuma sugestão pendente'
                      : 'Processe uma reunião para ver sugestões'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              pendingSuggestions.map((suggestion) => {
                if (!latestProcessedItem) return null;
                return (
                  <InboxSuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    isSelected={selectedSuggestions.has(suggestion.id)}
                    onSelect={handleSelectSuggestion}
                    onEdit={() => handleEdit(suggestion, latestProcessedItem.id)}
                    onAccept={() => handleAccept(suggestion, latestProcessedItem.id)}
                    onDiscard={() => handleDiscard(suggestion.id, latestProcessedItem.id)}
                    onLink={() => handleLinkToPriority(suggestion, latestProcessedItem.id)}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Sugestão</DialogTitle>
            <DialogDescription>
              Ajuste os campos antes de aceitar a sugestão
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Título da Prioridade
              </label>
              <Input
                value={editFormData.priorityTitle}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, priorityTitle: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Quadrante</label>
              <Select
                value={editFormData.priorityQuadrant}
                onValueChange={(value) =>
                  setEditFormData({
                    ...editFormData,
                    priorityQuadrant: value as EisenhowerQuadrant,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(quadrantLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {value}: {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Tags</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={editFormData.tagInput}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, tagInput: e.target.value })
                  }
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Digite uma tag e pressione Enter"
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Adicionar
                </Button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {editFormData.priorityTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Título da Tarefa
              </label>
              <Input
                value={editFormData.taskTitle}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, taskTitle: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Classificação
              </label>
              <Select
                value={editFormData.taskClassification}
                onValueChange={(value) =>
                  setEditFormData({
                    ...editFormData,
                    taskClassification: value as TaskClassification,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(classificationLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {editFormData.taskClassification === TaskClassification.SCHEDULE && (
              <div>
                <label className="text-sm font-medium mb-2 block">Data Ideal</label>
                <Input
                  type="date"
                  value={editFormData.taskIdealDate}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      taskIdealDate: e.target.value,
                    })
                  }
                />
              </div>
            )}
            {editFormData.taskClassification === TaskClassification.DELEGATE && (
              <div>
                <label className="text-sm font-medium mb-2 block">Responsável</label>
                <Input
                  value={editFormData.taskResponsible}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      taskResponsible: e.target.value,
                    })
                  }
                  placeholder="Nome do responsável"
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Vincular a Prioridade Existente (opcional)
              </label>
              <Select
                value={editFormData.linkToExistingPriorityId}
                onValueChange={(value) =>
                  setEditFormData({
                    ...editFormData,
                    linkToExistingPriorityId: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma prioridade existente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma (criar nova)</SelectItem>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.id} value={priority.id}>
                      {priority.title} ({priority.quadrant})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAcceptWithEdits}
              disabled={acceptMutation.isPending}
            >
              {acceptMutation.isPending ? 'Salvando...' : 'Salvar e Aceitar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={discardDialogOpen} onOpenChange={setDiscardDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Descartar Sugestão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja descartar esta sugestão? Esta ação não pode
              ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDiscardDialogOpen(false);
                setPendingDiscardId(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDiscard}
              disabled={discardMutation.isPending}
            >
              {discardMutation.isPending ? 'Descartando...' : 'Descartar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Vincular a Prioridade Existente</DialogTitle>
            <DialogDescription>
              Selecione uma prioridade existente para vincular a tarefa
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Prioridade Existente
              </label>
              <Select
                value={editFormData.linkToExistingPriorityId}
                onValueChange={(value) =>
                  setEditFormData({
                    ...editFormData,
                    linkToExistingPriorityId: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma prioridade" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.length === 0 ? (
                    <SelectItem value="" disabled>
                      Nenhuma prioridade disponível
                    </SelectItem>
                  ) : (
                    priorities.map((priority) => (
                      <SelectItem key={priority.id} value={priority.id}>
                        {priority.title} ({priority.quadrant})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Título da Tarefa
              </label>
              <Input
                value={editFormData.taskTitle}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, taskTitle: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Classificação
              </label>
              <Select
                value={editFormData.taskClassification}
                onValueChange={(value) =>
                  setEditFormData({
                    ...editFormData,
                    taskClassification: value as TaskClassification,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(classificationLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {editFormData.taskClassification === TaskClassification.SCHEDULE && (
              <div>
                <label className="text-sm font-medium mb-2 block">Data Ideal</label>
                <Input
                  type="date"
                  value={editFormData.taskIdealDate}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      taskIdealDate: e.target.value,
                    })
                  }
                />
              </div>
            )}
            {editFormData.taskClassification === TaskClassification.DELEGATE && (
              <div>
                <label className="text-sm font-medium mb-2 block">Responsável</label>
                <Input
                  value={editFormData.taskResponsible}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      taskResponsible: e.target.value,
                    })
                  }
                  placeholder="Nome do responsável"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleLinkAccept}
              disabled={acceptMutation.isPending || !editFormData.linkToExistingPriorityId}
            >
              {acceptMutation.isPending ? 'Salvando...' : 'Vincular e Aceitar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};
