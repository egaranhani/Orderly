import { Module } from '@nestjs/common';
import { CreateUserUseCase } from './create-user.use-case';
import { GetUserUseCase } from './get-user.use-case';
import { FirestoreModule } from '@infrastructure/persistence/firestore/firestore.module';

@Module({
  imports: [FirestoreModule],
  providers: [CreateUserUseCase, GetUserUseCase],
  exports: [CreateUserUseCase, GetUserUseCase],
})
export class UserModule {}

