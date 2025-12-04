import { decode } from '@toon-format/toon';
import { ActionSuggestion } from '@domain/entities/inbox-item.entity';
import { EisenhowerQuadrant } from '@domain/entities/priority.entity';
import { TaskClassification } from '@domain/entities/task.entity';

interface ToonSuggestionRow {
  id: string;
  relevantText?: string;
  actionSummary: string;
  priorityTitle: string;
  priorityQuadrant: string;
  priorityTags?: string;
  taskTitle: string;
  taskClassification: string;
  taskIdealDate?: string;
  taskResponsible?: string;
}

function mapQuadrant(quadrant: string): EisenhowerQuadrant {
  const mapping: Record<string, EisenhowerQuadrant> = {
    urgent_and_important: EisenhowerQuadrant.Q1,
    important_not_urgent: EisenhowerQuadrant.Q2,
    urgent_not_important: EisenhowerQuadrant.Q3,
    not_urgent_not_important: EisenhowerQuadrant.Q4,
  };

  const mapped = mapping[quadrant.toLowerCase()];
  if (!mapped) {
    throw new Error(`Invalid quadrant: ${quadrant}`);
  }
  return mapped;
}

function mapClassification(classification: string): TaskClassification {
  const mapping: Record<string, TaskClassification> = {
    do: TaskClassification.DO,
    schedule: TaskClassification.SCHEDULE,
    delegate: TaskClassification.DELEGATE,
    eliminate: TaskClassification.ELIMINATE,
  };

  const mapped = mapping[classification.toLowerCase()];
  if (!mapped) {
    throw new Error(`Invalid classification: ${classification}`);
  }
  return mapped;
}

function parseTags(tagsString?: string): string[] {
  if (!tagsString || tagsString.trim() === '') {
    return [];
  }
  return tagsString.split(',').map((tag) => tag.trim()).filter((tag) => tag.length > 0);
}

function parseDate(dateString?: string): Date | undefined {
  if (!dateString || dateString.trim() === '') {
    return undefined;
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return undefined;
  }
  return date;
}

export function parseToonSuggestions(
  toonContent: string,
  meetingReference: string,
): ActionSuggestion[] {
  try {
    const decoded = decode(toonContent);
    const parsed = decoded as unknown as { suggestions: ToonSuggestionRow[] };
    const suggestions = parsed.suggestions;

    if (!Array.isArray(suggestions)) {
      throw new Error('Invalid TOON format: suggestions must be an array');
    }

    return suggestions.map((row) => {
      const quadrant = mapQuadrant(row.priorityQuadrant);
      const classification = mapClassification(row.taskClassification);
      const tags = parseTags(row.priorityTags);
      const idealDate = parseDate(row.taskIdealDate);

      return new ActionSuggestion(
        row.id,
        row.actionSummary,
        {
          title: row.priorityTitle,
          quadrant,
          tags,
        },
        {
          title: row.taskTitle,
          classification,
          idealDate,
          responsible: row.taskResponsible,
        },
        meetingReference,
        row.relevantText,
      );
    });
  } catch (error) {
    throw new Error(`Failed to parse TOON suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function extractToonBlock(text: string): string {
  const toonBlockRegex = /```toon\n([\s\S]*?)\n```/;
  const match = text.match(toonBlockRegex);

  if (!match || !match[1]) {
    throw new Error('No TOON block found in response');
  }

  return match[1].trim();
}

