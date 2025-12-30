import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InboxItemResponseDto, InboxItemStatus } from '@/types/inbox.types';

interface InboxHistoryItemProps {
  item: InboxItemResponseDto;
  onSelect?: (itemId: string) => void;
  isExpanded?: boolean;
}

const statusLabels = {
  [InboxItemStatus.PENDING]: 'Pendente',
  [InboxItemStatus.PROCESSED]: 'Processado',
  [InboxItemStatus.ACCEPTED]: 'Aceito',
  [InboxItemStatus.DISCARDED]: 'Descartado',
};

const getStatusColor = (status: InboxItemStatus) => {
  const colors: Record<InboxItemStatus, string> = {
    [InboxItemStatus.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    [InboxItemStatus.PROCESSED]: 'bg-blue-100 text-blue-800 border-blue-200',
    [InboxItemStatus.ACCEPTED]: 'bg-green-100 text-green-800 border-green-200',
    [InboxItemStatus.DISCARDED]: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export const InboxHistoryItem: React.FC<InboxHistoryItemProps> = ({
  item,
  onSelect,
  isExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(isExpanded);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Data não disponível';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleClick = () => {
    setExpanded(!expanded);
    if (onSelect) {
      onSelect(item.id);
    }
  };

  return (
    <Card
      className="cursor-pointer hover:bg-accent transition-colors"
      onClick={handleClick}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-muted-foreground">
                📅 {formatDate(item.processedAt || item.createdAt)}
              </span>
              <Badge
                className={`${getStatusColor(item.status)} border text-xs`}
              >
                {statusLabels[item.status]}
              </Badge>
            </div>
            <p className="text-sm font-medium truncate">
              {item.meetingTitle || 'Reunião sem título'}
            </p>
            <p className="text-xs text-muted-foreground">
              {item.suggestions.length} sugestão(ões)
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="ml-2"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            {expanded ? '▼' : '▶'}
          </Button>
        </div>
        {expanded && (
          <div className="mt-3 pt-3 border-t space-y-2">
            <div className="text-xs text-muted-foreground">
              <p>
                <strong>Conteúdo:</strong> {item.meetingContent.substring(0, 200)}
                {item.meetingContent.length > 200 ? '...' : ''}
              </p>
            </div>
            {item.suggestions.length > 0 && (
              <div className="text-xs">
                <strong>Sugestões:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  {item.suggestions.map((suggestion) => (
                    <li key={suggestion.id}>{suggestion.actionSummary}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

