import type { SearchParamsInput } from '../../../shared/application/search/search-params.js';
import type { SearchOutput } from '../../../shared/application/search/search-result.js';
import type { UseCase } from '../../../shared/application/use-case.js';
import type { UserRepository } from '../ports/user.repository.js';
import { toUserOutput, type UserOutput } from '../user-output.js';
import { userSearchParams } from '../user-search.js';

export class ListUsersUseCase implements UseCase<
  SearchParamsInput,
  SearchOutput<UserOutput>
> {
  constructor(private readonly users: UserRepository) {}

  async execute(input: SearchParamsInput): Promise<SearchOutput<UserOutput>> {
    const result = await this.users.search(userSearchParams(input));
    return result.map(toUserOutput).toOutput();
  }
}
