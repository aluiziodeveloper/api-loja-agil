import type { UseCase } from '../../../shared/application/use-case.js';
import { loadUser } from '../load-user.js';
import type { UserRepository } from '../ports/user.repository.js';

export type DeleteAccountInput = {
  userId: string;
};

export class DeleteAccountUseCase implements UseCase<DeleteAccountInput, void> {
  constructor(private readonly users: UserRepository) {}

  async execute(input: DeleteAccountInput): Promise<void> {
    const user = await loadUser(this.users, input.userId);
    await this.users.delete(user.id);
  }
}
