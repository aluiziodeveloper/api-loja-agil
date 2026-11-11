import { Body, Controller, Inject, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import type { Principal } from '../../../shared/infrastructure/auth/access-tokens.js';
import { CurrentPrincipal } from '../../../shared/infrastructure/auth/principal.js';
import { ZodValidationPipe } from '../../../shared/infrastructure/http/zod-validation.pipe.js';
import { UpdateProfileUseCase } from '../../application/use-cases/update-profile.use-case.js';
import { presentUser, type UserResponse } from './user.presenter.js';

/** `strict`: um `role` no corpo é recusado, não ignorado em silêncio. */
export const updateMeBody = z
  .object({
    name: z.string().optional(),
    email: z.string().optional(),
  })
  .strict();

type UpdateMeBody = z.infer<typeof updateMeBody>;

@ApiTags('Identidade')
@Controller('me')
export class UpdateMeController {
  constructor(
    @Inject(UpdateProfileUseCase)
    private readonly updateProfile: UpdateProfileUseCase,
  ) {}

  @Patch()
  async handle(
    @CurrentPrincipal() me: Principal,
    @Body(new ZodValidationPipe(updateMeBody)) body: UpdateMeBody,
  ): Promise<UserResponse> {
    return presentUser(
      await this.updateProfile.execute({ ...body, userId: me.userId }),
    );
  }
}
