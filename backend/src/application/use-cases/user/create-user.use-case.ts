import { Injectable, Inject } from '@nestjs/common';
import { User } from '@domain/entities/user.entity';
import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { CreateUserDto, UserResponseDto } from '@application/dtos/user.dto';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(dto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findByGoogleId(dto.googleId);
    
    if (existingUser) {
      return this.mapToResponse(existingUser);
    }

    const user = new User(
      dto.email,
      dto.name,
      dto.googleId,
      dto.workspaceDomain,
      dto.picture,
    );

    const createdUser = await this.userRepository.create(user);
    return this.mapToResponse(createdUser);
  }

  private mapToResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      workspaceDomain: user.workspaceDomain,
      picture: user.picture,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

