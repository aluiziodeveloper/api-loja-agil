import { SortDirection } from '../../../shared/application/search/search-params.js';
import type { SearchResult } from '../../../shared/application/search/search-result.js';
import { paginate } from '../../../shared/application/__tests__/paginate.js';
import type { UniqueId } from '../../../shared/domain/unique-id.value-object.js';
import type { Email } from '../../domain/email.value-object.js';
import { User, type UserSnapshot } from '../../domain/user.entity.js';
import type { UserRepository } from '../ports/user.repository.js';
import type { UserSearchParams } from '../user-search.js';

const collator = new Intl.Collator('pt-BR');

/** Ignora maiúsculas, como o modo "insensitive" do Prisma. */
function matches(snapshot: UserSnapshot, filter: string | null): boolean {
  const term = filter?.toLowerCase() ?? '';
  return [snapshot.name, snapshot.email].some((text) =>
    text.toLowerCase().includes(term),
  );
}

/** Empates são desfeitos pelo id, para a paginação ser estável. */
function compareBy(params: UserSearchParams) {
  const field = params.sort();
  const direction = params.sortDirection() === SortDirection.DESC ? -1 : 1;
  return (first: UserSnapshot, second: UserSnapshot): number =>
    direction * collator.compare(first[field], second[field]) ||
    (first.id < second.id ? -1 : 1);
}

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

  /** Só para os testes: a porta não tem "listar tudo", só a busca paginada. */
  all(): User[] {
    return [...this.snapshots.values()].map((snapshot) =>
      User.restore(snapshot),
    );
  }

  async search(params: UserSearchParams): Promise<SearchResult<User>> {
    const matching = [...this.snapshots.values()]
      .filter((snapshot) => matches(snapshot, params.filter()))
      .sort(compareBy(params));
    return paginate(matching, params).map((snapshot) => User.restore(snapshot));
  }

  async delete(id: UniqueId): Promise<void> {
    this.snapshots.delete(id.toString());
  }

  private restore(snapshot?: UserSnapshot): User | null {
    return snapshot ? User.restore(snapshot) : null;
  }
}
