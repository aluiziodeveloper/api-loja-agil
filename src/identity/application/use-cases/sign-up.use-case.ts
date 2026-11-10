import type { UseCase } from '../../../shared/application/use-case.js';
import { Email } from '../../domain/email.value-object.js';
import { Name } from '../../domain/name.value-object.js';
import { Password } from '../../domain/password.value-object.js';
import { User } from '../../domain/user.entity.js';
import { EmailAlreadyInUseError } from '../errors/email-already-in-use.error.js';
import type { PasswordHasher } from '../ports/password-hasher.js';
import type { UserRepository } from '../ports/user.repository.js';
import { toUserOutput, type UserOutput } from '../user-output.js';

export type SignUpInput = {
  name: string;
  email: string;
  password: string;
};

export class SignUpUseCase implements UseCase<SignUpInput, UserOutput> {
  constructor(
    private readonly users: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: SignUpInput): Promise<UserOutput> {
    const name = Name.create(input.name);
    const email = Email.create(input.email);
    const password = Password.create(input.password);
    await this.ensureEmailIsAvailable(email);

    const passwordHash = await this.passwordHasher.hash(password);
    const user = User.register({ name, email, passwordHash });
    await this.users.save(user);
    return toUserOutput(user);
  }

  private async ensureEmailIsAvailable(email: Email): Promise<void> {
    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new EmailAlreadyInUseError(email.toString());
    }
  }
}
