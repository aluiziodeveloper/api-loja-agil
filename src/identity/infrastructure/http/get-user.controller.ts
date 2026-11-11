import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiData } from '../../../shared/infrastructure/openapi/api-docs.decorators.js';
import { GetProfileUseCase } from '../../application/use-cases/get-profile.use-case.js';
import {
  userResponse,
  presentUser,
  type UserResponse,
} from './user.presenter.js';
import { OPERATOR } from '../../../shared/infrastructure/auth/roles.js';
import { Roles } from '../../../shared/infrastructure/auth/roles.decorator.js';

@ApiTags('Identidade')
@Controller('users')
export class GetUserController {
  constructor(
    @Inject(GetProfileUseCase) private readonly getProfile: GetProfileUseCase,
  ) {}

  /** O id malformado não precisa de schema: o `UniqueId` responde INVALID_ID. */
  @Get(':id')
  @ApiData(userResponse)
  @Roles(OPERATOR)
  async handle(@Param('id') id: string): Promise<UserResponse> {
    return presentUser(await this.getProfile.execute({ userId: id }));
  }
}
