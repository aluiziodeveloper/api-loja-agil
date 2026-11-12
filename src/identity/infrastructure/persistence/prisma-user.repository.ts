import type { Prisma } from '../../../generated/prisma/client.js';
import { SearchResult } from '../../../shared/application/search/search-result.js';
import { pageOf } from '../../../shared/infrastructure/database/page-of.js';
import type { UserRepository } from '../../application/ports/user.repository.js';
import type { UserSearchParams } from '../../application/user-search.js';
import type { Email } from '../../domain/email.value-object.js';
import { User, type UserSnapshot } from '../../domain/user.entity.js';
import type { UniqueId } from '../../../shared/domain/unique-id.value-object.js';
import type { PrismaDatabase } from '../../../shared/infrastructure/database/prisma-database.js';

/** A tabela `users` espelha o snapshot: a linha já é o contrato com a borda. */
function toUser(row: UserSnapshot | null): User | null {
  return row ? User.restore(row) : null;
}

/** "Contém", sem diferenciar maiúsculas, no nome ou no e-mail. */
function whereFor(params: UserSearchParams): Prisma.UserWhereInput {
  const filter = params.filter();
  const contains = { contains: filter ?? '', mode: 'insensitive' } as const;
  return filter ? { OR: [{ name: contains }, { email: contains }] } : {};
}

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly database: PrismaDatabase) {}

  async save(user: User): Promise<void> {
    const { id, ...data } = user.toSnapshot();
    await this.database.client().user.upsert({
      where: { id },
      create: { id, ...data },
      update: data,
    });
  }

  async findById(id: UniqueId): Promise<User | null> {
    const row = await this.database
      .client()
      .user.findUnique({ where: { id: id.toString() } });
    return toUser(row);
  }

  async findByEmail(email: Email): Promise<User | null> {
    const row = await this.database
      .client()
      .user.findUnique({ where: { email: email.toString() } });
    return toUser(row);
  }

  async findAll(): Promise<User[]> {
    const rows = await this.database.client().user.findMany();
    return rows.map((row) => User.restore(row));
  }

  /** O campo pedido e, no empate, o id (D17). */
  async search(params: UserSearchParams): Promise<SearchResult<User>> {
    const where = whereFor(params);
    const orderBy = [
      { [params.sort()]: params.sortDirection() },
      { id: 'asc' as const },
    ];
    const client = this.database.client();
    const [rows, total] = await Promise.all([
      client.user.findMany({ where, ...pageOf(params, orderBy) }),
      client.user.count({ where }),
    ]);
    const items = rows.map((row) => User.restore(row));
    return SearchResult.create({ items, total, params });
  }

  /** `deleteMany` não falha quando o usuário não existe, como pede o contrato. */
  async delete(id: UniqueId): Promise<void> {
    await this.database
      .client()
      .user.deleteMany({ where: { id: id.toString() } });
  }
}
