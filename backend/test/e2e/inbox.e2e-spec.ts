import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/presentation/app.module';
import { createTestToken } from './helpers/test-auth.helper';
import { MockAiService } from '../mocks/mock-ai.service';

describe('InboxController (e2e)', () => {
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

  describe('POST /inbox', () => {
    it('should process an inbox item', () => {
      return request(app.getHttpServer())
        .post('/inbox')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          meetingTitle: 'Test Meeting',
          meetingContent: 'This is a test meeting with enough content to pass validation.',
        })
        .expect(201)
        .expect((res: request.Response) => {
          expect(res.body).toHaveProperty('inboxItemId');
          expect(res.body).toHaveProperty('suggestions');
          expect(Array.isArray(res.body.suggestions)).toBe(true);
        });
    });

    it('should return 400 if content is too short', () => {
      return request(app.getHttpServer())
        .post('/inbox')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          meetingContent: 'Short',
        })
        .expect(400);
    });
  });

  describe('GET /inbox', () => {
    it('should return list of inbox items', () => {
      return request(app.getHttpServer())
        .get('/inbox')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res: request.Response) => {
          expect(res.body).toHaveProperty('items');
          expect(Array.isArray(res.body.items)).toBe(true);
        });
    });
  });
});

