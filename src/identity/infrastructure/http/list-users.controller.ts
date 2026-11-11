import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ListUsersUseCase } from '../../application/use-cases/list-users.use-case.js';
import { presentUser, type UserResponse } from './user.presenter.js';
import { OPERATOR } from '../../../shared/infrastructure/auth/roles.js';
import { Roles } from '../../../shared/infrastructure/auth/roles.decorator.js';

@ApiTags('Identidade')
@Controller('users')
export class ListUsersController {
  constructor(
    @Inject(ListUsersUseCase) private readonly listUsers: ListUsersUseCase,
  ) {}

  @Get()
  @Roles(OPERATOR)
  async handle(): Promise<UserResponse[]> {
    const users = await this.listUsers.execute();
    return users.map(presentUser);
  }
}
