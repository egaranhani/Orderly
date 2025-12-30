import { http, HttpResponse } from 'msw';
import {
  PriorityResponseDto,
  EisenhowerQuadrant,
  PriorityStatus,
  PriorityOrigin,
} from '@/types/priority.types';
import {
  TaskResponseDto,
  TaskClassification,
  TaskStatus,
  TaskOrigin,
} from '@/types/task.types';
import {
  InboxItemResponseDto,
  InboxItemStatus,
  ActionSuggestionDto,
} from '@/types/inbox.types';

const baseUrl = '/api';

const mockPriorities: PriorityResponseDto[] = [
  {
    id: '1',
    userId: 'test-user-id',
    title: 'Prioridade Urgente e Importante',
    description: 'Esta é uma prioridade do quadrante Q1',
    quadrant: EisenhowerQuadrant.Q1,
    tags: ['urgente', 'importante'],
    status: PriorityStatus.ACTIVE,
    origin: PriorityOrigin.MANUAL,
    displayOrder: 0,
    taskCount: 2,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    userId: 'test-user-id',
    title: 'Prioridade Não Urgente mas Importante',
    description: 'Esta é uma prioridade do quadrante Q2',
    quadrant: EisenhowerQuadrant.Q2,
    tags: ['planejamento'],
    status: PriorityStatus.ACTIVE,
    origin: PriorityOrigin.MANUAL,
    displayOrder: 0,
    taskCount: 0,
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
  {
    id: '3',
    userId: 'test-user-id',
    title: 'Prioridade Urgente mas Não Importante',
    quadrant: EisenhowerQuadrant.Q3,
    tags: [],
    status: PriorityStatus.ACTIVE,
    origin: PriorityOrigin.AI,
    displayOrder: 0,
    taskCount: 1,
    createdAt: '2024-01-03T00:00:00.000Z',
    updatedAt: '2024-01-03T00:00:00.000Z',
  },
  {
    id: '4',
    userId: 'test-user-id',
    title: 'Prioridade Não Urgente e Não Importante',
    description: 'Esta é uma prioridade do quadrante Q4',
    quadrant: EisenhowerQuadrant.Q4,
    tags: [],
    status: PriorityStatus.ACTIVE,
    origin: PriorityOrigin.MANUAL,
    displayOrder: 0,
    taskCount: 1,
    createdAt: '2024-01-04T00:00:00.000Z',
    updatedAt: '2024-01-04T00:00:00.000Z',
  },
];

let priorities = [...mockPriorities];

const mockTasks: TaskResponseDto[] = [
  {
    id: 'task-1',
    userId: 'test-user-id',
    priorityId: '1',
    title: 'Tarefa relacionada',
    description: 'Descrição da tarefa',
    classification: TaskClassification.DO,
    status: TaskStatus.OPEN,
    origin: TaskOrigin.MANUAL,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'task-2',
    userId: 'test-user-id',
    priorityId: '1',
    title: 'Tarefa agendada',
    description: 'Tarefa para agendar',
    classification: TaskClassification.SCHEDULE,
    idealDate: '2024-01-15',
    status: TaskStatus.OPEN,
    origin: TaskOrigin.MANUAL,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'task-3',
    userId: 'test-user-id',
    priorityId: '1',
    title: 'Tarefa concluída',
    description: 'Tarefa já finalizada',
    classification: TaskClassification.DO,
    status: TaskStatus.COMPLETED,
    origin: TaskOrigin.MANUAL,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'task-4',
    userId: 'test-user-id',
    priorityId: '2',
    title: 'Tarefa Q2',
    description: 'Tarefa do quadrante Q2',
    classification: TaskClassification.DO,
    status: TaskStatus.OPEN,
    origin: TaskOrigin.MANUAL,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'task-5',
    userId: 'test-user-id',
    priorityId: '3',
    title: 'Tarefa Q3',
    description: 'Tarefa do quadrante Q3',
    classification: TaskClassification.DO,
    status: TaskStatus.OPEN,
    origin: TaskOrigin.MANUAL,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'task-6',
    userId: 'test-user-id',
    priorityId: '4',
    title: 'Tarefa Q4',
    description: 'Tarefa do quadrante Q4',
    classification: TaskClassification.DO,
    status: TaskStatus.OPEN,
    origin: TaskOrigin.MANUAL,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'task-7',
    userId: 'test-user-id',
    priorityId: '1',
    title: 'Tarefa cancelada',
    description: 'Tarefa que foi cancelada',
    classification: TaskClassification.DO,
    status: TaskStatus.CANCELLED,
    origin: TaskOrigin.MANUAL,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

let tasks = [...mockTasks];

const mockInboxItems: InboxItemResponseDto[] = [
  {
    id: 'inbox-1',
    userId: 'test-user-id',
    meetingTitle: 'Reunião de Planejamento',
    meetingContent: 'Resumo da reunião de planejamento...',
    status: InboxItemStatus.PROCESSED,
    suggestions: [
      {
        id: 'suggestion-1',
        actionSummary: 'Revisar proposta técnica com equipe',
        suggestedPriority: {
          title: 'Revisar proposta técnica',
          quadrant: EisenhowerQuadrant.Q1,
          tags: ['trabalho', 'urgente'],
        },
        suggestedTask: {
          title: 'Agendar reunião com equipe técnica',
          classification: TaskClassification.SCHEDULE,
          idealDate: '2024-01-20',
        },
        meetingReference: 'Reunião de Planejamento',
      },
      {
        id: 'suggestion-2',
        actionSummary: 'Enviar relatório mensal',
        suggestedPriority: {
          title: 'Relatório mensal',
          quadrant: EisenhowerQuadrant.Q2,
          tags: ['trabalho'],
        },
        suggestedTask: {
          title: 'Preparar e enviar relatório',
          classification: TaskClassification.DO,
        },
        meetingReference: 'Reunião de Planejamento',
      },
    ],
    processedAt: '2024-01-15T10:00:00.000Z',
    createdAt: '2024-01-15T09:00:00.000Z',
    updatedAt: '2024-01-15T10:00:00.000Z',
  },
];

let inboxItems = [...mockInboxItems];

export const handlers = [
  http.get(`${baseUrl}/auth/dev-token`, () => {
    return HttpResponse.json({
      access_token: 'test-token',
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        workspaceDomain: 'test.orderlyai.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  }),

  http.get(`${baseUrl}/priorities`, ({ request }) => {
    const url = new URL(request.url);
    const quadrant = url.searchParams.get('quadrant');

    let filtered = priorities.filter(
      (p) => p.status !== PriorityStatus.ARCHIVED
    );

    if (quadrant) {
      filtered = filtered.filter((p) => p.quadrant === quadrant);
    }

    return HttpResponse.json({ priorities: filtered });
  }),

  http.get(`${baseUrl}/priorities/:id`, ({ params }) => {
    const { id } = params;
    const priority = priorities.find((p) => p.id === id);

    if (!priority) {
      return HttpResponse.json(
        { error: 'Priority not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json(priority);
  }),

  http.post(`${baseUrl}/priorities`, async ({ request }) => {
    const body = await request.json();
    const newPriority: PriorityResponseDto = {
      id: `new-${Date.now()}`,
      userId: 'test-user-id',
      title: (body as any).title,
      description: (body as any).description,
      quadrant: (body as any).quadrant,
      tags: (body as any).tags || [],
      status: PriorityStatus.ACTIVE,
      origin: (body as any).origin || PriorityOrigin.MANUAL,
      displayOrder: priorities.length,
      taskCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    priorities.push(newPriority);
    return HttpResponse.json(newPriority, { status: 201 });
  }),

  http.patch(`${baseUrl}/priorities/:id`, async ({ params, request }) => {
    const { id } = params;
    const body = await request.json();
    const index = priorities.findIndex((p) => p.id === id);

    if (index === -1) {
      return HttpResponse.json(
        { error: 'Priority not found' },
        { status: 404 }
      );
    }

    priorities[index] = {
      ...priorities[index],
      ...(body as any),
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(priorities[index]);
  }),

  http.post(`${baseUrl}/priorities/:id/move`, async ({ params, request }) => {
    const { id } = params;
    const body = await request.json();
    const index = priorities.findIndex((p) => p.id === id);

    if (index === -1) {
      return HttpResponse.json(
        { error: 'Priority not found' },
        { status: 404 }
      );
    }

    priorities[index] = {
      ...priorities[index],
      quadrant: (body as any).quadrant,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(priorities[index]);
  }),

  http.post(`${baseUrl}/priorities/:id/archive`, ({ params }) => {
    const { id } = params;
    const index = priorities.findIndex((p) => p.id === id);

    if (index === -1) {
      return HttpResponse.json(
        { error: 'Priority not found' },
        { status: 404 }
      );
    }

    priorities[index] = {
      ...priorities[index],
      status: PriorityStatus.ARCHIVED,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(priorities[index]);
  }),

  http.post(`${baseUrl}/priorities/:quadrant/reorder`, async ({ params, request }) => {
    const { quadrant } = params;
    const body = await request.json();
    const { priorityIds } = body as { priorityIds: string[] };

    if (!priorityIds || priorityIds.length === 0) {
      return HttpResponse.json(
        { error: 'priorityIds array cannot be empty' },
        { status: 400 }
      );
    }

    // Verificar se todas as prioridades existem e estão no mesmo quadrante
    for (const id of priorityIds) {
      const priority = priorities.find((p) => p.id === id);
      if (!priority) {
        return HttpResponse.json(
          { error: 'Priority not found' },
          { status: 404 }
        );
      }
      if (priority.quadrant !== quadrant) {
        return HttpResponse.json(
          { error: 'All priorities must be in the same quadrant' },
          { status: 400 }
        );
      }
    }

    // Atualizar displayOrder das prioridades
    priorityIds.forEach((id, index) => {
      const priority = priorities.find((p) => p.id === id);
      if (priority && priority.quadrant === quadrant) {
        priority.displayOrder = index;
        priority.updatedAt = new Date().toISOString();
      }
    });

    return HttpResponse.json({ success: true });
  }),

  http.delete(`${baseUrl}/priorities/:id`, ({ params }) => {
    const { id } = params;
    priorities = priorities.filter((p) => p.id !== id);
    return HttpResponse.json(null, { status: 204 });
  }),

  http.get(`${baseUrl}/priorities/:id/tasks`, ({ params }) => {
    const { id } = params;
    const priority = priorities.find((p) => p.id === id);

    if (!priority) {
      return HttpResponse.json(
        { error: 'Priority not found' },
        { status: 404 }
      );
    }

    const priorityTasks = tasks.filter((t) => t.priorityId === id);
    return HttpResponse.json({ tasks: priorityTasks });
  }),

  http.post(`${baseUrl}/priorities/:id/tasks`, async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as any;
    const newTask: TaskResponseDto = {
      id: `task-${Date.now()}`,
      userId: 'test-user-id',
      priorityId: id as string,
      title: body.title,
      description: body.description,
      classification: body.classification,
      idealDate: body.idealDate,
      responsible: body.responsible,
      status: TaskStatus.OPEN,
      origin: body.origin || TaskOrigin.MANUAL,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    tasks.push(newTask);
    return HttpResponse.json(newTask, { status: 201 });
  }),

  http.get(`${baseUrl}/tasks/:id`, ({ params }) => {
    const { id } = params;
    const task = tasks.find((t) => t.id === id);

    if (!task) {
      return HttpResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json(task);
  }),

  http.patch(`${baseUrl}/tasks/:id`, async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as any;
    const index = tasks.findIndex((t) => t.id === id);

    if (index === -1) {
      return HttpResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    tasks[index] = {
      ...tasks[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(tasks[index]);
  }),

  http.post(`${baseUrl}/tasks/:id/move`, async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as any;
    const index = tasks.findIndex((t) => t.id === id);

    if (index === -1) {
      return HttpResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    tasks[index] = {
      ...tasks[index],
      classification: body.classification,
      idealDate: body.idealDate,
      responsible: body.responsible,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(tasks[index]);
  }),

  http.post(`${baseUrl}/tasks/:id/complete`, ({ params }) => {
    const { id } = params;
    const index = tasks.findIndex((t) => t.id === id);

    if (index === -1) {
      return HttpResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    tasks[index] = {
      ...tasks[index],
      status: TaskStatus.COMPLETED,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(tasks[index]);
  }),

  http.post(`${baseUrl}/tasks/:id/cancel`, ({ params }) => {
    const { id } = params;
    const index = tasks.findIndex((t) => t.id === id);

    if (index === -1) {
      return HttpResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    tasks[index] = {
      ...tasks[index],
      status: TaskStatus.CANCELLED,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(tasks[index]);
  }),

  http.delete(`${baseUrl}/tasks/:id`, ({ params }) => {
    const { id } = params;
    tasks = tasks.filter((t) => t.id !== id);
    return HttpResponse.json(null, { status: 204 });
  }),

  http.post(`${baseUrl}/inbox`, async ({ request }) => {
    const body = await request.json() as any;
    const newInboxItem: InboxItemResponseDto = {
      id: `inbox-${Date.now()}`,
      userId: 'test-user-id',
      meetingTitle: body.meetingTitle,
      meetingContent: body.meetingContent,
      status: InboxItemStatus.PROCESSED,
      suggestions: [
        {
          id: `suggestion-${Date.now()}-1`,
          actionSummary: 'Ação sugerida pela IA',
          suggestedPriority: {
            title: 'Prioridade sugerida',
            quadrant: EisenhowerQuadrant.Q1,
            tags: ['trabalho'],
          },
          suggestedTask: {
            title: 'Tarefa sugerida',
            classification: TaskClassification.DO,
          },
          meetingReference: body.meetingTitle || 'Reunião sem título',
        },
      ],
      processedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    inboxItems.push(newInboxItem);
    return HttpResponse.json({
      inboxItemId: newInboxItem.id,
      suggestions: newInboxItem.suggestions,
    });
  }),

  http.get(`${baseUrl}/inbox`, ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');

    let filtered = inboxItems;
    if (status) {
      filtered = inboxItems.filter((item) => item.status === status);
    }

    return HttpResponse.json({ items: filtered });
  }),

  http.get(`${baseUrl}/inbox/:id`, ({ params }) => {
    const { id } = params;
    const item = inboxItems.find((i) => i.id === id);

    if (!item) {
      return HttpResponse.json(
        { error: 'Inbox item not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json(item);
  }),

  http.post(`${baseUrl}/inbox/:id/accept`, async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as any;
    const item = inboxItems.find((i) => i.id === id);

    if (!item) {
      return HttpResponse.json(
        { error: 'Inbox item not found' },
        { status: 404 }
      );
    }

    const newPriority: PriorityResponseDto = {
      id: `priority-${Date.now()}`,
      userId: 'test-user-id',
      title: body.adjustments?.priority?.title || 'Nova Prioridade',
      quadrant: body.adjustments?.priority?.quadrant || EisenhowerQuadrant.Q1,
      tags: body.adjustments?.priority?.tags || [],
      status: PriorityStatus.ACTIVE,
      origin: PriorityOrigin.AI,
      displayOrder: 0,
      taskCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newTask: TaskResponseDto = {
      id: `task-${Date.now()}`,
      userId: 'test-user-id',
      priorityId: body.linkToExistingPriorityId || newPriority.id,
      title: body.adjustments?.task?.title || 'Nova Tarefa',
      classification: body.adjustments?.task?.classification || TaskClassification.DO,
      idealDate: body.adjustments?.task?.idealDate,
      responsible: body.adjustments?.task?.responsible,
      status: TaskStatus.OPEN,
      origin: TaskOrigin.AI,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!body.linkToExistingPriorityId) {
      priorities.push(newPriority);
    }
    tasks.push(newTask);

    item.status = InboxItemStatus.ACCEPTED;
    item.updatedAt = new Date().toISOString();

    return HttpResponse.json({
      priority: body.linkToExistingPriorityId ? priorities.find(p => p.id === body.linkToExistingPriorityId) : newPriority,
      task: newTask,
    });
  }),

  http.post(`${baseUrl}/inbox/:id/discard`, async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as any;
    const item = inboxItems.find((i) => i.id === id);

    if (!item) {
      return HttpResponse.json(
        { error: 'Inbox item not found' },
        { status: 404 }
      );
    }

    item.status = InboxItemStatus.DISCARDED;
    item.updatedAt = new Date().toISOString();

    return HttpResponse.json({ success: true });
  }),

  http.delete(`${baseUrl}/inbox/:id`, ({ params }) => {
    const { id } = params;
    inboxItems = inboxItems.filter((i) => i.id !== id);
    return HttpResponse.json({ success: true });
  }),
];

export const resetHandlers = () => {
  priorities = [...mockPriorities];
  tasks = [...mockTasks];
  inboxItems = [...mockInboxItems];
};
