import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiNoContent } from '../../../shared/infrastructure/openapi/api-docs.decorators.js';
import type { Principal } from '../../../shared/infrastructure/auth/access-tokens.js';
import { CurrentPrincipal } from '../../../shared/infrastructure/auth/principal.js';
import { DeleteAccountUseCase } from '../../application/use-cases/delete-account.use-case.js';

@ApiTags('Identidade')
@Controller('me')
export class DeleteMeController {
  constructor(
    @Inject(DeleteAccountUseCase)
    private readonly deleteAccount: DeleteAccountUseCase,
  ) {}

  @Delete()
  @ApiNoContent()
  @HttpCode(HttpStatus.NO_CONTENT)
  async handle(@CurrentPrincipal() me: Principal): Promise<void> {
    await this.deleteAccount.execute({ userId: me.userId });
  }
}
