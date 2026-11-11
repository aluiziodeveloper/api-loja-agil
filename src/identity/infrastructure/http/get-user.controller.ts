import { Controller, Get, Inject, Param } from '@nestjs/common';
import { GetProfileUseCase } from '../../application/use-cases/get-profile.use-case.js';
import { presentUser, type UserResponse } from './user.presenter.js';

@Controller('users')
export class GetUserController {
  constructor(
    @Inject(GetProfileUseCase) private readonly getProfile: GetProfileUseCase,
  ) {}

  /** O id malformado não precisa de schema: o `UniqueId` responde INVALID_ID. */
  @Get(':id')
  async handle(@Param('id') id: string): Promise<UserResponse> {
    return presentUser(await this.getProfile.execute({ userId: id }));
  }
}
