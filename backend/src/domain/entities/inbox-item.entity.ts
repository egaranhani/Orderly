import { BaseEntity } from './base.entity';
import { EisenhowerQuadrant } from './priority.entity';
import { TaskClassification } from './task.entity';

export enum InboxItemStatus {
  PENDING = 'pending',
  PROCESSED = 'processed',
  ACCEPTED = 'accepted',
  DISCARDED = 'discarded',
}

export class ActionSuggestion {
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

  constructor(
    id: string,
    actionSummary: string,
    suggestedPriority: {
      title: string;
      quadrant: EisenhowerQuadrant;
      tags: string[];
    },
    suggestedTask: {
      title: string;
      classification: TaskClassification;
      idealDate?: Date;
      responsible?: string;
    },
    meetingReference: string,
    relevantText?: string,
  ) {
    this.id = id;
    this.relevantText = relevantText;
    this.actionSummary = actionSummary;
    this.suggestedPriority = suggestedPriority;
    this.suggestedTask = suggestedTask;
    this.meetingReference = meetingReference;
  }
}

export class InboxItem extends BaseEntity {
  userId: string;
  meetingTitle?: string;
  meetingContent: string;
  status: InboxItemStatus;
  suggestions: ActionSuggestion[];
  processedAt?: Date;

  constructor(
    userId: string,
    meetingContent: string,
    status: InboxItemStatus = InboxItemStatus.PENDING,
    suggestions: ActionSuggestion[] = [],
    meetingTitle?: string,
    processedAt?: Date,
    id?: string,
  ) {
    super(id);
    this.userId = userId;
    this.meetingTitle = meetingTitle;
    this.meetingContent = meetingContent;
    this.status = status;
    this.suggestions = suggestions;
    this.processedAt = processedAt;
  }
}

