import type { UniqueId } from '../../../shared/domain/unique-id.value-object.js';
import type { Email } from '../../domain/email.value-object.js';
import type { User } from '../../domain/user.entity.js';

export interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: UniqueId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findAll(): Promise<User[]>;
  delete(id: UniqueId): Promise<void>;
}
