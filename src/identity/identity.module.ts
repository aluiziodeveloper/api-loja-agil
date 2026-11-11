import { Module } from '@nestjs/common';
import { PrismaDatabase } from '../shared/infrastructure/database/prisma-database.js';
import { PasswordHasher } from './application/ports/password-hasher.js';
import { UserRepository } from './application/ports/user.repository.js';
import { SignUpUseCase } from './application/use-cases/sign-up.use-case.js';
import { ScryptPasswordHasher } from './infrastructure/crypto/scrypt-password-hasher.js';
import { SignUpController } from './infrastructure/http/sign-up.controller.js';
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository.js';

/**
 * A raiz de composição do contexto: cada porta ganha o seu adaptador, e cada
 * caso de uso é montado por uma factory, sem saber que o Nest existe.
 */
@Module({
  controllers: [SignUpController],
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
    {
      provide: SignUpUseCase,
      useFactory: (users: UserRepository, passwordHasher: PasswordHasher) =>
        new SignUpUseCase(users, passwordHasher),
      inject: [UserRepository, PasswordHasher],
    },
  ],
})
export class IdentityModule {}
