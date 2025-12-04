import { Message } from '../../src/domain/entities/conversation.entity';
import { IAiService, ProcessInboxResult } from '../../src/domain/services/ai.service.interface';
import { ActionSuggestion } from '../../src/domain/entities/inbox-item.entity';
import { EisenhowerQuadrant } from '../../src/domain/entities/priority.entity';
import { TaskClassification } from '../../src/domain/entities/task.entity';

export class MockAiService implements IAiService {
  async generateResponse(messages: Message[]): Promise<string> {
    return 'Mock response';
  }

  async processInbox(
    meetingTitle: string | undefined,
    meetingContent: string,
  ): Promise<ProcessInboxResult> {
    const meetingReference = meetingTitle || 'Reunião sem título';

    const suggestions: ActionSuggestion[] = [
      new ActionSuggestion(
        'sug1',
        'Fechar proposta comercial',
        {
          title: 'Fechar proposta Congregação',
          quadrant: EisenhowerQuadrant.Q1,
          tags: ['trabalho', 'comercial'],
        },
        {
          title: 'Revisar orçamento com financeiro',
          classification: TaskClassification.DO,
        },
        meetingReference,
        'Na reunião foi decidido fechar a proposta comercial',
      ),
      new ActionSuggestion(
        'sug2',
        'Organizar férias',
        {
          title: 'Planejar férias de julho',
          quadrant: EisenhowerQuadrant.Q2,
          tags: ['pessoal', 'família'],
        },
        {
          title: 'Pesquisar hotéis',
          classification: TaskClassification.SCHEDULE,
          idealDate: new Date('2024-07-01'),
        },
        meetingReference,
        'Planejamento para julho foi discutido',
      ),
      new ActionSuggestion(
        'sug3',
        'Delegar análise técnica',
        {
          title: 'Implementar nova feature',
          quadrant: EisenhowerQuadrant.Q3,
          tags: ['trabalho', 'desenvolvimento'],
        },
        {
          title: 'Analisar viabilidade técnica',
          classification: TaskClassification.DELEGATE,
          responsible: 'João Silva',
        },
        meetingReference,
        'João ficará responsável pela análise técnica',
      ),
    ];

    return { suggestions };
  }
}

