import { Module } from '@nestjs/common';
import { PrismaDatabase } from '../shared/infrastructure/database/prisma-database.js';
import { provideUseCase } from '../shared/infrastructure/nest/provide-use-case.js';
import { PasswordHasher } from './application/ports/password-hasher.js';
import { UserRepository } from './application/ports/user.repository.js';
import { GetProfileUseCase } from './application/use-cases/get-profile.use-case.js';
import { ListUsersUseCase } from './application/use-cases/list-users.use-case.js';
import { SignUpUseCase } from './application/use-cases/sign-up.use-case.js';
import { ScryptPasswordHasher } from './infrastructure/crypto/scrypt-password-hasher.js';
import { GetUserController } from './infrastructure/http/get-user.controller.js';
import { ListUsersController } from './infrastructure/http/list-users.controller.js';
import { SignUpController } from './infrastructure/http/sign-up.controller.js';
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository.js';

/**
 * A raiz de composição do contexto: cada porta ganha o seu adaptador, e cada
 * caso de uso é montado por uma factory, sem saber que o Nest existe.
 */
@Module({
  controllers: [SignUpController, GetUserController, ListUsersController],
  providers: [
    {
      provide: UserRepository,
      useFactory: (database: PrismaDatabase) =>
        new PrismaUserRepository(database),
      inject: [PrismaDatabase],
    },
    {
      provide: PasswordHasher,
      useFactory: () => new ScryptPasswordHasher(),
    },
    provideUseCase(SignUpUseCase, [UserRepository, PasswordHasher]),
    provideUseCase(GetProfileUseCase, [UserRepository]),
    provideUseCase(ListUsersUseCase, [UserRepository]),
  ],
})
export class IdentityModule {}
