import { Controller, Get, Inject } from '@nestjs/common';
import { ListUsersUseCase } from '../../application/use-cases/list-users.use-case.js';
import { presentUser, type UserResponse } from './user.presenter.js';

@Controller('users')
export class ListUsersController {
  constructor(
    @Inject(ListUsersUseCase) private readonly listUsers: ListUsersUseCase,
  ) {}

  @Get()
  async handle(): Promise<UserResponse[]> {
    const users = await this.listUsers.execute();
    return users.map(presentUser);
  }
}
