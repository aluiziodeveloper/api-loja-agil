import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import type { Principal } from '../../../shared/infrastructure/auth/access-tokens.js';
import { CurrentPrincipal } from '../../../shared/infrastructure/auth/principal.js';
import { ZodValidationPipe } from '../../../shared/infrastructure/http/zod-validation.pipe.js';
import { ChangePasswordUseCase } from '../../application/use-cases/change-password.use-case.js';

export const changeMyPasswordBody = z.object({
  currentPassword: z.string(),
  newPassword: z.string(),
});

type ChangeMyPasswordBody = z.infer<typeof changeMyPasswordBody>;

@ApiTags('Identidade')
@Controller('me')
export class ChangeMyPasswordController {
  constructor(
    @Inject(ChangePasswordUseCase)
    private readonly changePassword: ChangePasswordUseCase,
  ) {}

  @Put('password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async handle(
    @CurrentPrincipal() me: Principal,
    @Body(new ZodValidationPipe(changeMyPasswordBody))
    body: ChangeMyPasswordBody,
  ): Promise<void> {
    await this.changePassword.execute({ ...body, userId: me.userId });
  }
}
