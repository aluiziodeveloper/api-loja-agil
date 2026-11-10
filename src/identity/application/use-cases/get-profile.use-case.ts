import type { UseCase } from '../../../shared/application/use-case.js';
import { loadUser } from '../load-user.js';
import type { UserRepository } from '../ports/user.repository.js';
import { toUserOutput, type UserOutput } from '../user-output.js';

export type GetProfileInput = {
  userId: string;
};

export class GetProfileUseCase implements UseCase<GetProfileInput, UserOutput> {
  constructor(private readonly users: UserRepository) {}

  async execute(input: GetProfileInput): Promise<UserOutput> {
    const user = await loadUser(this.users, input.userId);
    return toUserOutput(user);
  }
}
