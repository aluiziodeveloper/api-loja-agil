import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { z } from 'zod';
import {
  ApiErrors,
  ApiPage,
  ApiQueryOf,
} from '../../../shared/infrastructure/openapi/api-docs.decorators.js';
import {
  type Page,
  presentPage,
} from '../../../shared/infrastructure/http/page.js';
import {
  searchQuery,
  sortQuery,
} from '../../../shared/infrastructure/http/search-query.js';
import { userSearchOptions } from '../../application/user-search.js';
import { ZodValidationPipe } from '../../../shared/infrastructure/http/zod-validation.pipe.js';
import { ListUsersUseCase } from '../../application/use-cases/list-users.use-case.js';
import {
  userResponse,
  presentUser,
  type UserResponse,
} from './user.presenter.js';
import { OPERATOR } from '../../../shared/infrastructure/auth/roles.js';
import { Roles } from '../../../shared/infrastructure/auth/roles.decorator.js';

/** Ordenação por `name` ou `email`; o filtro procura nos dois. */
export const listUsersQuery = searchQuery.extend({
  sort: sortQuery(userSearchOptions),
});

type ListUsersQuery = z.infer<typeof listUsersQuery>;

@ApiTags('Identidade')
@Controller('users')
export class ListUsersController {
  constructor(
    @Inject(ListUsersUseCase) private readonly listUsers: ListUsersUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Lista os usuários, com filtro, ordenação e página.',
  })
  @ApiErrors('INVALID_SEARCH_PARAMS')
  @ApiQueryOf(listUsersQuery)
  @ApiPage(userResponse)
  @Roles(OPERATOR)
  async handle(
    @Query(new ZodValidationPipe(listUsersQuery)) query: ListUsersQuery,
  ): Promise<Page<UserResponse>> {
    return presentPage(await this.listUsers.execute(query), presentUser);
  }
}
