import type { UseCase } from '../../../shared/application/use-case.js';
import { Email } from '../../domain/email.value-object.js';
import { UserNotFoundError } from '../errors/user-not-found.error.js';
import type { UserRepository } from '../ports/user.repository.js';
import { toUserOutput, type UserOutput } from '../user-output.js';

export type PromoteToOperatorInput = {
  email: string;
};

/** Pelo e-mail, que é como um operador conhece o colega que vai promover. */
export class PromoteToOperatorUseCase implements UseCase<
  PromoteToOperatorInput,
  UserOutput
> {
  constructor(private readonly users: UserRepository) {}

  async execute(input: PromoteToOperatorInput): Promise<UserOutput> {
    const user = await this.users.findByEmail(Email.create(input.email));
    if (!user) {
      throw new UserNotFoundError();
    }
    user.promoteToOperator();
    await this.users.save(user);
    return toUserOutput(user);
  }
}
