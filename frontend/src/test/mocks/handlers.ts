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
];

let tasks = [...mockTasks];

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
];

export const resetHandlers = () => {
  priorities = [...mockPriorities];
  tasks = [...mockTasks];
};
