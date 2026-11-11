import { HttpStatus } from '@nestjs/common';
import type { ErrorStatusMap } from '../../../shared/infrastructure/http/error-response.js';

/** Identidade & Acesso: o status HTTP de cada código de erro (docs/error-codes.md). */
export const identityErrorStatus = {
  INVALID_EMAIL: HttpStatus.BAD_REQUEST,
  INVALID_NAME: HttpStatus.BAD_REQUEST,
  WEAK_PASSWORD: HttpStatus.BAD_REQUEST,
  INVALID_PASSWORD_HASH: HttpStatus.INTERNAL_SERVER_ERROR,
  INVALID_ROLE: HttpStatus.BAD_REQUEST,
  EMAIL_ALREADY_IN_USE: HttpStatus.CONFLICT,
  INVALID_CREDENTIALS: HttpStatus.UNAUTHORIZED,
  USER_NOT_FOUND: HttpStatus.NOT_FOUND,
  INCORRECT_CURRENT_PASSWORD: HttpStatus.UNPROCESSABLE_ENTITY,
} as const satisfies ErrorStatusMap;
