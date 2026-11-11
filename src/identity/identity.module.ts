import { Module } from '@nestjs/common';
import { PrismaDatabase } from '../shared/infrastructure/database/prisma-database.js';
import { provideUseCase } from '../shared/infrastructure/nest/provide-use-case.js';
import { PasswordHasher } from './application/ports/password-hasher.js';
import { UserRepository } from './application/ports/user.repository.js';
import { ChangePasswordUseCase } from './application/use-cases/change-password.use-case.js';
import { DeleteAccountUseCase } from './application/use-cases/delete-account.use-case.js';
import { GetProfileUseCase } from './application/use-cases/get-profile.use-case.js';
import { ListUsersUseCase } from './application/use-cases/list-users.use-case.js';
import { PromoteToOperatorUseCase } from './application/use-cases/promote-to-operator.use-case.js';
import { SignInUseCase } from './application/use-cases/sign-in.use-case.js';
import { SignUpUseCase } from './application/use-cases/sign-up.use-case.js';
import { UpdateProfileUseCase } from './application/use-cases/update-profile.use-case.js';
import { ScryptPasswordHasher } from './infrastructure/crypto/scrypt-password-hasher.js';
import { ChangeMyPasswordController } from './infrastructure/http/change-my-password.controller.js';
import { DeleteMeController } from './infrastructure/http/delete-me.controller.js';
import { GetMeController } from './infrastructure/http/get-me.controller.js';
import { GetUserController } from './infrastructure/http/get-user.controller.js';
import { ListUsersController } from './infrastructure/http/list-users.controller.js';
import { PromoteToOperatorController } from './infrastructure/http/promote-to-operator.controller.js';
import { SignInController } from './infrastructure/http/sign-in.controller.js';
import { SignUpController } from './infrastructure/http/sign-up.controller.js';
import { UpdateMeController } from './infrastructure/http/update-me.controller.js';
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository.js';

/**
 * A raiz de composição do contexto: cada porta ganha o seu adaptador, e cada
 * caso de uso é montado por uma factory, sem saber que o Nest existe.
 */
@Module({
  controllers: [
    SignUpController,
    SignInController,
    GetUserController,
    ListUsersController,
    PromoteToOperatorController,
    GetMeController,
    UpdateMeController,
    ChangeMyPasswordController,
    DeleteMeController,
  ],
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
    provideUseCase(SignInUseCase, [UserRepository, PasswordHasher]),
    provideUseCase(GetProfileUseCase, [UserRepository]),
    provideUseCase(ListUsersUseCase, [UserRepository]),
    provideUseCase(PromoteToOperatorUseCase, [UserRepository]),
    provideUseCase(UpdateProfileUseCase, [UserRepository]),
    provideUseCase(ChangePasswordUseCase, [UserRepository, PasswordHasher]),
    provideUseCase(DeleteAccountUseCase, [UserRepository]),
  ],
})
export class IdentityModule {}
