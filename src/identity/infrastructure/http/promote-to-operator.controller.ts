import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiBodyOf,
  ApiData,
} from '../../../shared/infrastructure/openapi/api-docs.decorators.js';
import { z } from 'zod';
import { Roles } from '../../../shared/infrastructure/auth/roles.decorator.js';
import { OPERATOR } from '../../../shared/infrastructure/auth/roles.js';
import { ZodValidationPipe } from '../../../shared/infrastructure/http/zod-validation.pipe.js';
import { PromoteToOperatorUseCase } from '../../application/use-cases/promote-to-operator.use-case.js';
import {
  userResponse,
  presentUser,
  type UserResponse,
} from './user.presenter.js';

export const promoteToOperatorBody = z.object({ email: z.string() });

type PromoteToOperatorBody = z.infer<typeof promoteToOperatorBody>;

/** Só um operador promove outro; o primeiro nasce pelo `npm run operator:promote`. */
@ApiTags('Identidade')
@Controller('operators')
export class PromoteToOperatorController {
  constructor(
    @Inject(PromoteToOperatorUseCase)
    private readonly promoteToOperator: PromoteToOperatorUseCase,
  ) {}

  @Post()
  @ApiBodyOf(promoteToOperatorBody)
  @ApiData(userResponse)
  @HttpCode(HttpStatus.OK)
  @Roles(OPERATOR)
  async handle(
    @Body(new ZodValidationPipe(promoteToOperatorBody))
    body: PromoteToOperatorBody,
  ): Promise<UserResponse> {
    return presentUser(await this.promoteToOperator.execute(body));
  }
}
