import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiData } from '../../../shared/infrastructure/openapi/api-docs.decorators.js';
import { z } from 'zod';
import { ListUsersUseCase } from '../../application/use-cases/list-users.use-case.js';
import {
  userResponse,
  presentUser,
  type UserResponse,
} from './user.presenter.js';
import { OPERATOR } from '../../../shared/infrastructure/auth/roles.js';
import { Roles } from '../../../shared/infrastructure/auth/roles.decorator.js';

@ApiTags('Identidade')
@Controller('users')
export class ListUsersController {
  constructor(
    @Inject(ListUsersUseCase) private readonly listUsers: ListUsersUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista os usuários.' })
  @ApiData(z.array(userResponse))
  @Roles(OPERATOR)
  async handle(): Promise<UserResponse[]> {
    const users = await this.listUsers.execute();
    return users.map(presentUser);
  }
}
