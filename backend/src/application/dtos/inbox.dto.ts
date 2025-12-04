import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  MinLength,
  MaxLength,
  IsDateString,
  ArrayMaxSize,
} from 'class-validator';
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
  @IsOptional()
  @IsString()
  @MaxLength(200)
  meetingTitle?: string;

  @IsString()
  @MinLength(10)
  meetingContent: string;
}

export class AcceptSuggestionDto {
  @IsString()
  suggestionId: string;

  @IsOptional()
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

  @IsOptional()
  @IsString()
  linkToExistingPriorityId?: string;
}

export class DiscardSuggestionDto {
  @IsString()
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

