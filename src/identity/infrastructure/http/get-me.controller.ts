import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiData } from '../../../shared/infrastructure/openapi/api-docs.decorators.js';
import type { Principal } from '../../../shared/infrastructure/auth/access-tokens.js';
import { CurrentPrincipal } from '../../../shared/infrastructure/auth/principal.js';
import { GetProfileUseCase } from '../../application/use-cases/get-profile.use-case.js';
import {
  userResponse,
  presentUser,
  type UserResponse,
} from './user.presenter.js';

/**
 * `/me` não tem id na URL: o usuário é sempre o do token. Não existe "o
 * perfil de outro" para tentar, e por isso não há o que conferir.
 */
@ApiTags('Identidade')
@Controller('me')
export class GetMeController {
  constructor(
    @Inject(GetProfileUseCase) private readonly getProfile: GetProfileUseCase,
  ) {}

  @Get()
  @ApiData(userResponse)
  async handle(@CurrentPrincipal() me: Principal): Promise<UserResponse> {
    return presentUser(await this.getProfile.execute({ userId: me.userId }));
  }
}
