import type { SearchResult } from '../../../shared/application/search/search-result.js';
import type { UniqueId } from '../../../shared/domain/unique-id.value-object.js';
import type { Email } from '../../domain/email.value-object.js';
import type { User } from '../../domain/user.entity.js';
import type { UserSearchParams } from '../user-search.js';

/**
 * Porta como classe abstrata: some do caminho dos tipos como uma interface,
 * mas continua existindo em runtime e serve de token de injeção do Nest.
 */
export abstract class UserRepository {
  abstract save(user: User): Promise<void>;
  abstract findById(id: UniqueId): Promise<User | null>;
  abstract findByEmail(email: Email): Promise<User | null>;
  abstract search(params: UserSearchParams): Promise<SearchResult<User>>;
  abstract delete(id: UniqueId): Promise<void>;
}
