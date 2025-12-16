import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll, vi } from 'vitest';
import { server } from './mocks/server';
import { resetHandlers } from './mocks/handlers';

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  server.resetHandlers();
  resetHandlers();
});

afterAll(() => {
  server.close();
});
