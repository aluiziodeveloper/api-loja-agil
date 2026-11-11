import { Body, Controller, Inject, Post } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../../../shared/infrastructure/http/zod-validation.pipe.js';
import { SignUpUseCase } from '../../application/use-cases/sign-up.use-case.js';
import type { UserOutput } from '../../application/user-output.js';

/** Só o formato: tamanho da senha e e-mail válido são regras do domínio. */
export const signUpBody = z.object({
  name: z.string(),
  email: z.string(),
  password: z.string(),
});

type SignUpBody = z.infer<typeof signUpBody>;

/** Um controller por caso de uso: traduz a requisição e devolve a resposta. */
@Controller('users')
export class SignUpController {
  /** `@Inject` explícito: o token não depende do metadado gerado pelo compilador. */
  constructor(@Inject(SignUpUseCase) private readonly signUp: SignUpUseCase) {}

  @Post()
  async handle(
    @Body(new ZodValidationPipe(signUpBody)) body: SignUpBody,
  ): Promise<UserOutput> {
    return this.signUp.execute(body);
  }
}
