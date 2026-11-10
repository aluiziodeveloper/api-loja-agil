import type { UseCase } from '../../../shared/application/use-case.js';
import { Email } from '../../domain/email.value-object.js';
import { Name } from '../../domain/name.value-object.js';
import type { User } from '../../domain/user.entity.js';
import { EmailAlreadyInUseError } from '../errors/email-already-in-use.error.js';
import { loadUser } from '../load-user.js';
import type { UserRepository } from '../ports/user.repository.js';
import { toUserOutput, type UserOutput } from '../user-output.js';

export type UpdateProfileInput = {
  userId: string;
  name?: string;
  email?: string;
};

export class UpdateProfileUseCase implements UseCase<
  UpdateProfileInput,
  UserOutput
> {
  constructor(private readonly users: UserRepository) {}

  async execute(input: UpdateProfileInput): Promise<UserOutput> {
    const user = await loadUser(this.users, input.userId);
    if (input.name !== undefined) {
      user.rename(Name.create(input.name));
    }
    if (input.email !== undefined) {
      await this.changeEmail(user, Email.create(input.email));
    }
    await this.users.save(user);
    return toUserOutput(user);
  }

  private async changeEmail(user: User, email: Email): Promise<void> {
    if (user.hasEmail(email)) {
      return;
    }
    if (await this.users.findByEmail(email)) {
      throw new EmailAlreadyInUseError(email.toString());
    }
    user.changeEmail(email);
  }
}
