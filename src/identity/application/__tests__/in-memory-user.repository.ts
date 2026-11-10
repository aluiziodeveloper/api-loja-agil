import type { UniqueId } from '../../../shared/domain/unique-id.value-object.js';
import type { Email } from '../../domain/email.value-object.js';
import { User, type UserSnapshot } from '../../domain/user.entity.js';
import type { UserRepository } from '../ports/user.repository.js';

export class InMemoryUserRepository implements UserRepository {
  private readonly snapshots = new Map<string, UserSnapshot>();

  async save(user: User): Promise<void> {
    const snapshot = user.toSnapshot();
    this.snapshots.set(snapshot.id, snapshot);
  }

  async findById(id: UniqueId): Promise<User | null> {
    return this.restore(this.snapshots.get(id.toString()));
  }

  async findByEmail(email: Email): Promise<User | null> {
    const address = email.toString();
    const all = [...this.snapshots.values()];
    return this.restore(all.find((snapshot) => snapshot.email === address));
  }

  async findAll(): Promise<User[]> {
    return [...this.snapshots.values()].map((snapshot) =>
      User.restore(snapshot),
    );
  }

  async delete(id: UniqueId): Promise<void> {
    this.snapshots.delete(id.toString());
  }

  private restore(snapshot?: UserSnapshot): User | null {
    return snapshot ? User.restore(snapshot) : null;
  }
}
