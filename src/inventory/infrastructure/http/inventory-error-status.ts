import { HttpStatus } from '@nestjs/common';
import type { ErrorStatusMap } from '../../../shared/infrastructure/http/error-response.js';

/** Estoque: o status HTTP de cada código de erro (docs/error-codes.md). */
export const inventoryErrorStatus = {
  INVALID_STOCK_QUANTITY: HttpStatus.BAD_REQUEST,
  EMPTY_STOCK_MOVEMENT: HttpStatus.BAD_REQUEST,
  MISSING_ADJUSTMENT_REASON: HttpStatus.BAD_REQUEST,
  STOCK_BELOW_RESERVED: HttpStatus.CONFLICT,
  INSUFFICIENT_STOCK: HttpStatus.CONFLICT,
  RESERVED_STOCK_EXCEEDED: HttpStatus.CONFLICT,
  STOCK_ITEM_NOT_FOUND: HttpStatus.NOT_FOUND,
  STOCK_SHORTAGE: HttpStatus.UNPROCESSABLE_ENTITY,
} as const satisfies ErrorStatusMap;
