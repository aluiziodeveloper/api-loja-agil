import { HttpStatus } from '@nestjs/common';
import { RequestValidationError } from './request-validation.error.js';

describe('RequestValidationError', () => {
  it('should be a 400 with a stable code and the details', () => {
    const details = [{ path: 'name', message: 'Obrigatório' }];

    const error = new RequestValidationError(details);

    expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    expect(error.getResponse()).toEqual({
      code: 'VALIDATION_FAILED',
      message: 'A requisição tem campos inválidos.',
      details,
    });
  });
});
