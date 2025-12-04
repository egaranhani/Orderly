import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/presentation/app.module';
import { createTestToken } from './helpers/test-auth.helper';
import { MockAiService } from '../mocks/mock-ai.service';

describe('PriorityController (e2e)', () => {
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

  describe('POST /priorities', () => {
    it('should create a priority', () => {
      return request(app.getHttpServer())
        .post('/priorities')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Priority',
          quadrant: 'Q1',
          tags: ['test'],
        })
        .expect(201)
        .expect((res: request.Response) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe('Test Priority');
          expect(res.body.quadrant).toBe('Q1');
        });
    });

    it('should return 400 if title is too short', () => {
      return request(app.getHttpServer())
        .post('/priorities')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'AB',
          quadrant: 'Q1',
        })
        .expect(400);
    });

    it('should return 401 if not authenticated', () => {
      return request(app.getHttpServer())
        .post('/priorities')
        .send({
          title: 'Test Priority',
          quadrant: 'Q1',
        })
        .expect(401);
    });
  });

  describe('GET /priorities', () => {
    it('should return list of priorities', () => {
      return request(app.getHttpServer())
        .get('/priorities')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body).toHaveProperty('priorities');
          expect(Array.isArray(res.body.priorities)).toBe(true);
        });
    });

    it('should filter by quadrant', () => {
      return request(app.getHttpServer())
        .get('/priorities?quadrant=Q1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.priorities.every((p: any) => p.quadrant === 'Q1')).toBe(true);
        });
    });
  });

  describe('GET /priorities/:id', () => {
    let priorityId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/priorities')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Priority to Get',
          quadrant: 'Q2',
        });
      priorityId = response.body.id;
    });

    it('should return a priority by id', () => {
      return request(app.getHttpServer())
        .get(`/priorities/${priorityId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.id).toBe(priorityId);
          expect(res.body.title).toBe('Priority to Get');
        });
    });

    it('should return 404 if priority not found', () => {
      return request(app.getHttpServer())
        .get('/priorities/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PATCH /priorities/:id', () => {
    let priorityId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/priorities')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Priority to Update',
          quadrant: 'Q3',
        });
      priorityId = response.body.id;
    });

    it('should update a priority', () => {
      return request(app.getHttpServer())
        .patch(`/priorities/${priorityId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Priority',
        })
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.title).toBe('Updated Priority');
        });
    });
  });

  describe('DELETE /priorities/:id', () => {
    let priorityId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/priorities')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Priority to Delete',
          quadrant: 'Q4',
        });
      priorityId = response.body.id;
    });

    it('should delete a priority', () => {
      return request(app.getHttpServer())
        .delete(`/priorities/${priorityId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body.success).toBe(true);
        });
    });
  });
});

