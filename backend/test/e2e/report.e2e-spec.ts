import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/presentation/app.module';
import { createTestToken } from './helpers/test-auth.helper';
import { MockAiService } from '../mocks/mock-ai.service';

describe('ReportController (e2e)', () => {
  let app: INestApplication;
  let testUserId: string;
  let authToken: string;

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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /reports/daily', () => {
    it('should return daily report', () => {
      return request(app.getHttpServer())
        .get('/reports/daily')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body).toHaveProperty('date');
          expect(res.body).toHaveProperty('prioritiesByQuadrant');
          expect(res.body).toHaveProperty('openTasks');
          expect(res.body).toHaveProperty('completedTasksToday');
        });
    });
  });

  describe('GET /reports/weekly', () => {
    it('should return weekly report', () => {
      return request(app.getHttpServer())
        .get('/reports/weekly')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body).toHaveProperty('weekStart');
          expect(res.body).toHaveProperty('weekEnd');
          expect(res.body).toHaveProperty('completedTasksByClassification');
          expect(res.body).toHaveProperty('actionsByOrigin');
        });
    });
  });
});

