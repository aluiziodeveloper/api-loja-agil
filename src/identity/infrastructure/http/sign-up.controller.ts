import { Body, Controller, Inject, Post, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiBodyOf,
  ApiData,
  ApiErrors,
} from '../../../shared/infrastructure/openapi/api-docs.decorators.js';
import { z } from 'zod';
import { ZodValidationPipe } from '../../../shared/infrastructure/http/zod-validation.pipe.js';
import { SignUpUseCase } from '../../application/use-cases/sign-up.use-case.js';
import {
  userResponse,
  presentUser,
  type UserResponse,
} from './user.presenter.js';
import { Public } from '../../../shared/infrastructure/auth/public.decorator.js';

/** Só o formato: tamanho da senha e e-mail válido são regras do domínio. */
export const signUpBody = z.object({
  name: z.string(),
  email: z.string(),
  password: z.string(),
});

type SignUpBody = z.infer<typeof signUpBody>;

/** Um controller por caso de uso: traduz a requisição e devolve a resposta. */
@ApiTags('Identidade')
@Controller('users')
export class SignUpController {
  /** `@Inject` explícito: o token não depende do metadado gerado pelo compilador. */
  constructor(@Inject(SignUpUseCase) private readonly signUp: SignUpUseCase) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Cadastra um cliente.' })
  @ApiErrors(
    'INVALID_EMAIL',
    'INVALID_NAME',
    'WEAK_PASSWORD',
    'EMAIL_ALREADY_IN_USE',
  )
  @ApiBodyOf(signUpBody)
  @ApiData(userResponse, HttpStatus.CREATED)
  async handle(
    @Body(new ZodValidationPipe(signUpBody)) body: SignUpBody,
  ): Promise<UserResponse> {
    return presentUser(await this.signUp.execute(body));
  }
}
