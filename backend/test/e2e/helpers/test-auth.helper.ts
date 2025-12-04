import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export function createTestToken(userId: string, email: string = 'test@example.com', workspaceDomain: string = 'example.com'): string {
  const jwtService = new JwtService({
    secret: process.env.JWT_SECRET || 'test-secret-key',
  });

  const payload = {
    sub: userId,
    email,
    workspaceDomain,
  };

  return jwtService.sign(payload);
}

