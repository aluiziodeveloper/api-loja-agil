import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiBodyOf,
  ApiData,
  ApiErrors,
} from '../../../shared/infrastructure/openapi/api-docs.decorators.js';
import { z } from 'zod';
import { AccessTokens } from '../../../shared/infrastructure/auth/access-tokens.js';
import { ZodValidationPipe } from '../../../shared/infrastructure/http/zod-validation.pipe.js';
import { SignInUseCase } from '../../application/use-cases/sign-in.use-case.js';
import {
  accessTokenResponse,
  type AccessTokenResponse,
  presentAccessToken,
} from './access-token.presenter.js';
import { Public } from '../../../shared/infrastructure/auth/public.decorator.js';

export const signInBody = z.object({
  email: z.string(),
  password: z.string(),
});

type SignInBody = z.infer<typeof signInBody>;

/**
 * O caso de uso diz quem é o usuário; o token é assunto da borda HTTP. Por
 * isso o `SignInUseCase` não conhece o JWT, e o controller junta os dois.
 */
@ApiTags('Identidade')
@Controller('auth')
export class SignInController {
  constructor(
    @Inject(SignInUseCase) private readonly signIn: SignInUseCase,
    @Inject(AccessTokens) private readonly accessTokens: AccessTokens,
  ) {}

  @Public()
  @Post('sign-in')
  @ApiOperation({
    summary: 'Entra com e-mail e senha e recebe o token de acesso.',
  })
  @ApiErrors('INVALID_CREDENTIALS')
  @ApiBodyOf(signInBody)
  @ApiData(accessTokenResponse)
  @HttpCode(HttpStatus.OK)
  async handle(
    @Body(new ZodValidationPipe(signInBody)) body: SignInBody,
  ): Promise<AccessTokenResponse> {
    const user = await this.signIn.execute(body);
    const token = await this.accessTokens.issue({
      userId: user.id,
      role: user.role,
    });
    return presentAccessToken(token);
  }
}
