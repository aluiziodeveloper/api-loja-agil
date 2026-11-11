import { BadRequestException } from '@nestjs/common';

export type ValidationIssue = {
  path: string;
  message: string;
};

/** A requisição não tem o formato esperado: campos ausentes ou de outro tipo. */
export class RequestValidationError extends BadRequestException {
  readonly code = 'VALIDATION_FAILED';

  constructor(readonly details: ValidationIssue[]) {
    super({
      code: 'VALIDATION_FAILED',
      message: 'A requisição tem campos inválidos.',
      details,
    });
  }
}
