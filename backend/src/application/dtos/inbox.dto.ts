import {
  EisenhowerQuadrant,
} from '@domain/entities/priority.entity';
import {
  TaskClassification,
} from '@domain/entities/task.entity';
import {
  InboxItemStatus,
} from '@domain/entities/inbox-item.entity';

export class ProcessInboxDto {
  meetingTitle?: string;
  meetingContent: string;
}

export class AcceptSuggestionDto {
  suggestionId: string;
  adjustments?: {
    priority?: {
      title?: string;
      quadrant?: EisenhowerQuadrant;
      tags?: string[];
    };
    task?: {
      title?: string;
      classification?: TaskClassification;
      idealDate?: Date;
      responsible?: string;
    };
  };
  linkToExistingPriorityId?: string;
}

export class DiscardSuggestionDto {
  suggestionId: string;
}

export class ActionSuggestionDto {
  id: string;
  relevantText?: string;
  actionSummary: string;
  suggestedPriority: {
    title: string;
    quadrant: EisenhowerQuadrant;
    tags: string[];
  };
  suggestedTask: {
    title: string;
    classification: TaskClassification;
    idealDate?: Date;
    responsible?: string;
  };
  meetingReference: string;
}

export class InboxItemResponseDto {
  id: string;
  userId: string;
  meetingTitle?: string;
  meetingContent: string;
  status: InboxItemStatus;
  suggestions: ActionSuggestionDto[];
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

