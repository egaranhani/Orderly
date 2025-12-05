import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export const InboxPage: React.FC = () => {
  const [meetingContent, setMeetingContent] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<any>(null);

  const mockSuggestions = [
    {
      id: '1',
      actionSummary: 'Revisar proposta técnica com equipe',
      suggestedPriority: {
        title: 'Revisar proposta técnica',
        quadrant: 'Q1' as const,
        tags: ['trabalho', 'urgente'],
      },
      suggestedTask: {
        title: 'Agendar reunião com equipe técnica',
        classification: 'schedule' as const,
        idealDate: '2024-01-20',
      },
      meetingReference: 'Reunião de Planejamento - 15/01/2024',
    },
    {
      id: '2',
      actionSummary: 'Enviar relatório mensal',
      suggestedPriority: {
        title: 'Relatório mensal',
        quadrant: 'Q2' as const,
        tags: ['trabalho'],
      },
      suggestedTask: {
        title: 'Preparar e enviar relatório',
        classification: 'do' as const,
      },
      meetingReference: 'Reunião de Planejamento - 15/01/2024',
    },
  ];

  const handleProcess = () => {
    console.log('Processar reunião:', { meetingTitle, meetingContent });
  };

  const handleAccept = (suggestion: any) => {
    console.log('Aceitar sugestão:', suggestion);
  };

  const handleEdit = (suggestion: any) => {
    setSelectedSuggestion(suggestion);
    setEditDialogOpen(true);
  };

  const handleDiscard = (suggestionId: string) => {
    console.log('Descartar sugestão:', suggestionId);
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Inbox</h1>
        <p className="text-muted-foreground mt-1">
          Processe resumos de reuniões e revise sugestões da IA
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
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
                <textarea
                  className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Cole ou digite o resumo da reunião aqui..."
                  value={meetingContent}
                  onChange={(e) => setMeetingContent(e.target.value)}
                />
              </div>
              <Button
                onClick={handleProcess}
                disabled={!meetingContent.trim()}
                className="w-full"
              >
                Processar com IA
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Sugestões Processadas</h2>
            <p className="text-sm text-muted-foreground">
              {mockSuggestions.length} sugestão(ões) disponível(is)
            </p>
          </div>

          <div className="space-y-4">
            {mockSuggestions.map((suggestion) => (
              <Card key={suggestion.id}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {suggestion.actionSummary}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {suggestion.meetingReference}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Prioridade Sugerida</h4>
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm">
                          <strong>Título:</strong> {suggestion.suggestedPriority.title}
                        </p>
                        <p className="text-sm">
                          <strong>Quadrante:</strong> {suggestion.suggestedPriority.quadrant}
                        </p>
                        <div className="flex gap-2 mt-2">
                          {suggestion.suggestedPriority.tags.map((tag: string) => (
                            <span
                              key={tag}
                              className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1">Tarefa Sugerida</h4>
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm">
                          <strong>Título:</strong> {suggestion.suggestedTask.title}
                        </p>
                        <p className="text-sm">
                          <strong>Classificação:</strong>{' '}
                          {suggestion.suggestedTask.classification}
                        </p>
                        {suggestion.suggestedTask.idealDate && (
                          <p className="text-sm">
                            <strong>Data Ideal:</strong>{' '}
                            {suggestion.suggestedTask.idealDate}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => handleEdit(suggestion)}
                        variant="outline"
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAccept(suggestion)}
                      >
                        Aceitar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDiscard(suggestion.id)}
                      >
                        Descartar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Sugestão</DialogTitle>
            <DialogDescription>
              Ajuste os campos antes de aceitar a sugestão
            </DialogDescription>
          </DialogHeader>
          {selectedSuggestion && (
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Título da Prioridade
                </label>
                <Input
                  defaultValue={selectedSuggestion.suggestedPriority.title}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Título da Tarefa
                </label>
                <Input
                  defaultValue={selectedSuggestion.suggestedTask.title}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setEditDialogOpen(false)}>
              Salvar e Aceitar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};
