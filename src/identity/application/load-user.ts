import { UniqueId } from '../../shared/domain/unique-id.value-object.js';
import type { User } from '../domain/user.entity.js';
import { UserNotFoundError } from './errors/user-not-found.error.js';
import type { UserRepository } from './ports/user.repository.js';

export async function loadUser(
  users: UserRepository,
  userId: string,
): Promise<User> {
  const user = await users.findById(UniqueId.from(userId));
  if (!user) {
    throw new UserNotFoundError();
  }
  return user;
}
