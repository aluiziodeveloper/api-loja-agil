import type { Role } from '../domain/role.js';
import type { User } from '../domain/user.entity.js';

export type UserOutput = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export function toUserOutput(user: User): UserOutput {
  const { id, name, email, role } = user.toSnapshot();
  return { id, name, email, role };
}
