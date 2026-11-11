import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { ConcurrentUpdateError } from '../../application/concurrent-update.error.js';
import { InvalidIdError } from '../../domain/invalid-id.error.js';
import { toErrorResponse } from './error-response.js';
import { RequestValidationError } from './request-validation.error.js';

describe('toErrorResponse', () => {
  const statusByCode = {
    INVALID_ID: HttpStatus.BAD_REQUEST,
    CONCURRENT_UPDATE: HttpStatus.CONFLICT,
  };

  it('should answer a domain error with the status of its code', () => {
    const response = toErrorResponse(new ConcurrentUpdateError(), statusByCode);

    expect(response).toEqual({
      status: 409,
      body: {
        code: 'CONCURRENT_UPDATE',
        message: 'O registro foi alterado por outra operação; tente de novo.',
      },
    });
  });

  it('should answer 500 to a domain error whose code has no status', () => {
    const response = toErrorResponse(new InvalidIdError('x'), {});

    expect(response.status).toBe(500);
    expect(response.body.code).toBe('INVALID_ID');
  });

  it('should keep the code and details of a request validation error', () => {
    const details = [{ path: 'name', message: 'Obrigatório' }];

    const response = toErrorResponse(
      new RequestValidationError(details),
      statusByCode,
    );

    expect(response).toEqual({
      status: 400,
      body: {
        code: 'VALIDATION_FAILED',
        message: 'A requisição tem campos inválidos.',
        details,
      },
    });
  });

  it('should name the code of other HTTP errors after their status', () => {
    const response = toErrorResponse(
      new NotFoundException('Cannot GET /nada'),
      statusByCode,
    );

    expect(response).toEqual({
      status: 404,
      body: { code: 'NOT_FOUND', message: 'Cannot GET /nada' },
    });
  });

  it('should fall back to the number of an unknown status', () => {
    const response = toErrorResponse(
      new HttpException('Client closed request', 499),
      statusByCode,
    );

    expect(response.body.code).toBe('HTTP_499');
  });

  it('should hide the details of an unexpected error', () => {
    const response = toErrorResponse(
      new TypeError("Cannot read properties of undefined (reading 'trim')"),
      statusByCode,
    );

    expect(response).toEqual({
      status: 500,
      body: {
        code: 'INTERNAL_ERROR',
        message: 'Erro interno. Tente de novo mais tarde.',
      },
    });
  });
});
