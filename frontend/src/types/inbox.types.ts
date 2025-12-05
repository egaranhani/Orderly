import { EisenhowerQuadrant } from './priority.types';
import { TaskClassification } from './task.types';

export enum InboxItemStatus {
  PENDING = 'pending',
  PROCESSED = 'processed',
  ACCEPTED = 'accepted',
  DISCARDED = 'discarded',
}

export interface ActionSuggestionDto {
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
    idealDate?: string;
    responsible?: string;
  };
  meetingReference: string;
}

export interface ProcessInboxDto {
  meetingTitle?: string;
  meetingContent: string;
}

export interface AcceptSuggestionDto {
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
      idealDate?: string;
      responsible?: string;
    };
  };
  linkToExistingPriorityId?: string;
}

export interface DiscardSuggestionDto {
  suggestionId: string;
}

export interface InboxItemResponseDto {
  id: string;
  userId: string;
  meetingTitle?: string;
  meetingContent: string;
  status: InboxItemStatus;
  suggestions: ActionSuggestionDto[];
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}
