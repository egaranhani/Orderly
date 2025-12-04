import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ChatVertexAI } from '@langchain/google-vertexai';
import { Message } from '@domain/entities/conversation.entity';
import { IAiService, ProcessInboxResult } from '@domain/services/ai.service.interface';
import { extractToonBlock, parseToonSuggestions } from './toon-parser.util';

@Injectable()
export class VertexAiService implements IAiService {
  private readonly model: ChatVertexAI;

  constructor() {
    this.model = new ChatVertexAI({
      model: 'gemini-2.0-flash-exp',
      temperature: 0.7,
      location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
    });
  }

  async generateResponse(messages: Message[]): Promise<string> {
    const formattedMessages = messages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      content: msg.content,
    }));

    const response = await this.model.invoke(formattedMessages);
    return response.content as string;
  }

  async processInbox(
    meetingTitle: string | undefined,
    meetingContent: string,
  ): Promise<ProcessInboxResult> {
    const prompt = this.buildInboxPrompt(meetingContent);

    try {
      const response = await this.model.invoke([
        {
          role: 'user',
          content: prompt,
        },
      ]);

      const responseText = response.content as string;
      const toonBlock = extractToonBlock(responseText);
      const meetingReference = meetingTitle || 'Reunião sem título';
      const suggestions = parseToonSuggestions(toonBlock, meetingReference);

      return { suggestions };
    } catch (error) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(
          `Failed to process inbox with AI: ${error.message}`,
        );
      }
      throw new InternalServerErrorException('Failed to process inbox with AI: Unknown error');
    }
  }

  private buildInboxPrompt(meetingContent: string): string {
    return `Você é um assistente especializado em extrair ações e prioridades de resumos de reuniões.

Analise o seguinte resumo de reunião e identifique:
1. Prioridades que devem ser criadas (com quadrante Eisenhower)
2. Tarefas específicas vinculadas a cada prioridade (com classificação)

Resumo da reunião:
${meetingContent}

Retorne a resposta no formato TOON seguindo esta estrutura:

\`\`\`toon
suggestions[N]{id,relevantText,actionSummary,priorityTitle,priorityQuadrant,priorityTags,taskTitle,taskClassification,taskIdealDate,taskResponsible}:
  sug1,"Na reunião foi decidido...","Fechar proposta comercial","Fechar proposta Congregação","urgent_and_important","trabalho,comercial","Revisar orçamento com financeiro","do",,
  sug2,"Planejamento para julho...","Organizar férias","Planejar férias de julho","important_not_urgent","pessoal,família","Pesquisar hotéis","schedule","2024-07-01",
  sug3,"João ficará responsável...","Delegar análise técnica","Implementar nova feature","urgent_not_important","trabalho,desenvolvimento","Analisar viabilidade técnica","delegate",,"João Silva"
\`\`\`

**Nota:** Campos vazios são representados por vírgulas consecutivas (ex: \`,,,\`). Strings com vírgulas internas devem ser escapadas ou usar outro delimitador.

Campos:
- id: identificador único da sugestão
- relevantText: trecho do resumo relevante (opcional)
- actionSummary: resumo curto da ação sugerida
- priorityTitle: título da prioridade sugerida
- priorityQuadrant: urgent_and_important | important_not_urgent | urgent_not_important | not_urgent_not_important
- priorityTags: tags separadas por vírgula (opcional)
- taskTitle: título da tarefa sugerida
- taskClassification: do | schedule | delegate | eliminate
- taskIdealDate: data ISO (opcional, apenas para schedule)
- taskResponsible: nome do responsável (opcional, apenas para delegate)`;
  }
}

