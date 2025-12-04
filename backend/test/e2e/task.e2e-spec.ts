import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/presentation/app.module';
import { createTestToken } from './helpers/test-auth.helper';
import { MockAiService } from '../mocks/mock-ai.service';

describe('TaskController (e2e)', () => {
  let app: INestApplication;
  let testUserId: string;
  let authToken: string;
  let priorityId: string;

  beforeAll(async () => {
    testUserId = 'test-user-e2e-' + Date.now();
    authToken = createTestToken(testUserId);

    const useMockAi = process.env.USE_MOCK_AI !== 'false';
    
    let moduleBuilder = Test.createTestingModule({
      imports: [AppModule],
    });

    if (useMockAi) {
      moduleBuilder = moduleBuilder
        .overrideProvider('IAiService')
        .useClass(MockAiService);
      console.log('📌 E2E: Usando MockAiService para testes');
    } else {
      console.log('📌 E2E: Usando VertexAiService real (requer credenciais Google Cloud)');
    }

    const moduleFixture: TestingModule = await moduleBuilder.compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    const priorityResponse = await request(app.getHttpServer())
      .post('/priorities')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test Priority for Tasks',
        quadrant: 'Q1',
      });
    priorityId = priorityResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /priorities/:priorityId/tasks', () => {
    it('should create a task', () => {
      return request(app.getHttpServer())
        .post(`/priorities/${priorityId}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task',
          classification: 'do',
        })
        .expect(201)
        .expect((res: request.Response) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe('Test Task');
          expect(res.body.classification).toBe('do');
        });
    });

    it('should return 400 if title is too short', () => {
      return request(app.getHttpServer())
        .post(`/priorities/${priorityId}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'AB',
          classification: 'do',
        })
        .expect(400);
    });
  });

  describe('GET /priorities/:priorityId/tasks', () => {
    it('should return list of tasks for a priority', () => {
      return request(app.getHttpServer())
        .get(`/priorities/${priorityId}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body).toHaveProperty('tasks');
          expect(Array.isArray(res.body.tasks)).toBe(true);
        });
    });
  });

  describe('GET /tasks/:id', () => {
    let taskId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post(`/priorities/${priorityId}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Task to Get',
          classification: 'do',
        });
      taskId = response.body.id;
    });

    it('should return a task by id', () => {
      return request(app.getHttpServer())
        .get(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.id).toBe(taskId);
        });
    });
  });
});

