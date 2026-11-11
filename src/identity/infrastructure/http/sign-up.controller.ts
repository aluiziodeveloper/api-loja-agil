import { Body, Controller, Inject, Post } from '@nestjs/common';
import {
  SignUpUseCase,
  type SignUpInput,
} from '../../application/use-cases/sign-up.use-case.js';
import type { UserOutput } from '../../application/user-output.js';

/** Um controller por caso de uso: traduz a requisição e devolve a resposta. */
@Controller('users')
export class SignUpController {
  /** `@Inject` explícito: o token não depende do metadado gerado pelo compilador. */
  constructor(@Inject(SignUpUseCase) private readonly signUp: SignUpUseCase) {}

  @Post()
  async handle(@Body() body: SignUpInput): Promise<UserOutput> {
    return this.signUp.execute(body);
  }
}
