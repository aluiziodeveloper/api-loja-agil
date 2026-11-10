import type { UseCase } from '../../../shared/application/use-case.js';
import type { UserRepository } from '../ports/user.repository.js';
import { toUserOutput, type UserOutput } from '../user-output.js';

const byName = new Intl.Collator('pt-BR');

export class ListUsersUseCase implements UseCase<void, UserOutput[]> {
  constructor(private readonly users: UserRepository) {}

  async execute(): Promise<UserOutput[]> {
    const users = await this.users.findAll();
    return users
      .map((user) => toUserOutput(user))
      .sort((first, second) => byName.compare(first.name, second.name));
  }
}
