import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ActionSuggestionDto } from '@/types/inbox.types';
import { EisenhowerQuadrant } from '@/types/priority.types';
import { TaskClassification } from '@/types/task.types';

interface InboxSuggestionCardProps {
  suggestion: ActionSuggestionDto;
  onEdit: (suggestion: ActionSuggestionDto) => void;
  onAccept: (suggestion: ActionSuggestionDto) => void;
  onDiscard: (suggestionId: string) => void;
  onLink?: (suggestion: ActionSuggestionDto) => void;
  isSelected?: boolean;
  onSelect?: (suggestionId: string, selected: boolean) => void;
}

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

const getQuadrantColor = (quadrant: EisenhowerQuadrant) => {
  const colors: Record<EisenhowerQuadrant, string> = {
    [EisenhowerQuadrant.Q1]: 'bg-red-100 text-red-800 border-red-200',
    [EisenhowerQuadrant.Q2]: 'bg-blue-100 text-blue-800 border-blue-200',
    [EisenhowerQuadrant.Q3]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    [EisenhowerQuadrant.Q4]: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  return colors[quadrant] || 'bg-gray-100 text-gray-800 border-gray-200';
};

const getClassificationColor = (classification: TaskClassification) => {
  const colors: Record<TaskClassification, string> = {
    [TaskClassification.DO]: 'bg-green-100 text-green-800 border-green-200',
    [TaskClassification.SCHEDULE]: 'bg-blue-100 text-blue-800 border-blue-200',
    [TaskClassification.DELEGATE]: 'bg-purple-100 text-purple-800 border-purple-200',
    [TaskClassification.ELIMINATE]: 'bg-red-100 text-red-800 border-red-200',
  };
  return colors[classification] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export const InboxSuggestionCard: React.FC<InboxSuggestionCardProps> = ({
  suggestion,
  onEdit,
  onAccept,
  onDiscard,
  onLink,
  isSelected = false,
  onSelect,
}) => {
  const [showRelevantText, setShowRelevantText] = useState(false);

  return (
    <Card className={isSelected ? 'ring-2 ring-primary' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {onSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => onSelect(suggestion.id, e.target.checked)}
                className="mr-2"
              />
            )}
            <CardTitle className="text-base">{suggestion.actionSummary}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {suggestion.meetingReference}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium mb-1">Prioridade Sugerida</h4>
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm mb-2">
                <strong>Título:</strong> {suggestion.suggestedPriority.title}
              </p>
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  className={`${getQuadrantColor(
                    suggestion.suggestedPriority.quadrant
                  )} border`}
                >
                  {suggestion.suggestedPriority.quadrant}:{' '}
                  {quadrantLabels[suggestion.suggestedPriority.quadrant]}
                </Badge>
              </div>
              {suggestion.suggestedPriority.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-2">
                  {suggestion.suggestedPriority.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Tarefa Sugerida</h4>
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm mb-2">
                <strong>Título:</strong> {suggestion.suggestedTask.title}
              </p>
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  className={`${getClassificationColor(
                    suggestion.suggestedTask.classification
                  )} border`}
                >
                  {classificationLabels[suggestion.suggestedTask.classification]}
                </Badge>
              </div>
              {suggestion.suggestedTask.idealDate && (
                <p className="text-sm mb-1">
                  <strong>Data Ideal:</strong>{' '}
                  {new Date(suggestion.suggestedTask.idealDate).toLocaleDateString(
                    'pt-BR'
                  )}
                </p>
              )}
              {suggestion.suggestedTask.responsible && (
                <p className="text-sm">
                  <strong>Responsável:</strong>{' '}
                  {suggestion.suggestedTask.responsible}
                </p>
              )}
            </div>
          </div>
          {suggestion.relevantText && (
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRelevantText(!showRelevantText)}
                className="text-xs"
              >
                {showRelevantText ? 'Ocultar' : 'Ver'} texto relevante
              </Button>
              {showRelevantText && (
                <div className="mt-2 p-3 bg-muted rounded-md text-sm italic">
                  {suggestion.relevantText}
                </div>
              )}
            </div>
          )}
          <div className="flex gap-2 pt-2 flex-wrap">
            <Button
              size="sm"
              onClick={() => onEdit(suggestion)}
              variant="outline"
            >
              Editar
            </Button>
            {onLink && (
              <Button
                size="sm"
                onClick={() => onLink(suggestion)}
                variant="secondary"
              >
                Vincular
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => onAccept(suggestion)}
            >
              Aceitar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDiscard(suggestion.id)}
            >
              Descartar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

