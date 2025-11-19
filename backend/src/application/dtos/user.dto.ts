export class CreateUserDto {
  email: string;
  name: string;
  googleId: string;
  workspaceDomain: string;
  picture?: string;
}

export class UserResponseDto {
  id: string;
  email: string;
  name: string;
  workspaceDomain: string;
  picture?: string;
  createdAt: Date;
  updatedAt: Date;
}

