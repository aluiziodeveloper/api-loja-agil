import { HttpStatus } from '@nestjs/common';
import type { ErrorStatusMap } from '../../../shared/infrastructure/http/error-response.js';

/** Catálogo: o status HTTP de cada código de erro (docs/error-codes.md). */
export const catalogErrorStatus = {
  INVALID_PRODUCT_NAME: HttpStatus.BAD_REQUEST,
  SKU_ALREADY_IN_USE: HttpStatus.CONFLICT,
  PRODUCT_NOT_FOUND: HttpStatus.NOT_FOUND,
} as const satisfies ErrorStatusMap;
