import { HttpStatus } from '@nestjs/common';
import type { ErrorStatusMap } from './error-response.js';

/** Shared Kernel: o status HTTP de cada código de erro (docs/error-codes.md). */
export const sharedErrorStatus = {
  INVALID_ID: HttpStatus.BAD_REQUEST,
  INVALID_MONEY: HttpStatus.BAD_REQUEST,
  INVALID_SEARCH_PARAMS: HttpStatus.BAD_REQUEST,
  INVALID_SKU: HttpStatus.BAD_REQUEST,
  CONCURRENT_UPDATE: HttpStatus.CONFLICT,
} as const satisfies ErrorStatusMap;
