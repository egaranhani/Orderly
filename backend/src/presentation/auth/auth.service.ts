import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserUseCase } from '@application/use-cases/user/create-user.use-case';
import { CreateUserDto } from '@application/dtos/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly createUserUseCase: CreateUserUseCase,
  ) {}

  async login(user: any) {
    const userDto: CreateUserDto = {
      email: user.email,
      name: user.name,
      googleId: user.googleId,
      workspaceDomain: user.workspaceDomain || this.extractDomain(user.email),
      picture: user.picture,
    };

    const createdUser = await this.createUserUseCase.execute(userDto);

    const payload = {
      sub: createdUser.id,
      email: createdUser.email,
      workspaceDomain: createdUser.workspaceDomain,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: createdUser,
    };
  }

  async generateDevToken() {
    const devUserId = 'dev-user-id';
    const devEmail = 'dev@orderlyai.com';
    const devWorkspaceDomain = 'orderlyai.com';

    const payload = {
      sub: devUserId,
      email: devEmail,
      workspaceDomain: devWorkspaceDomain,
    };

    const token = this.jwtService.sign(payload);

    const devUser = {
      id: devUserId,
      email: devEmail,
      name: 'Dev User',
      workspaceDomain: devWorkspaceDomain,
      picture: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      access_token: token,
      user: devUser,
    };
  }

  private extractDomain(email: string): string {
    return email.split('@')[1] || '';
  }
}

