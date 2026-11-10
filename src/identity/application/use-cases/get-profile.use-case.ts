import type { UseCase } from '../../../shared/application/use-case.js';
import { UniqueId } from '../../../shared/domain/unique-id.value-object.js';
import type { User } from '../../domain/user.entity.js';
import { UserNotFoundError } from '../errors/user-not-found.error.js';
import type { UserRepository } from '../ports/user.repository.js';
import { toUserOutput, type UserOutput } from '../user-output.js';

export type GetProfileInput = {
  userId: string;
};

export class GetProfileUseCase implements UseCase<GetProfileInput, UserOutput> {
  constructor(private readonly users: UserRepository) {}

  async execute(input: GetProfileInput): Promise<UserOutput> {
    const user = await this.findUser(input.userId);
    return toUserOutput(user);
  }

  private async findUser(userId: string): Promise<User> {
    const user = await this.users.findById(UniqueId.from(userId));
    if (!user) {
      throw new UserNotFoundError();
    }
    return user;
  }
}
