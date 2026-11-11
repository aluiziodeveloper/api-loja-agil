import { HttpStatus } from '@nestjs/common';
import type { ErrorStatusMap } from '../../../shared/infrastructure/http/error-response.js';

/** Pedidos: o status HTTP de cada código de erro (docs/error-codes.md). */
export const orderingErrorStatus = {
  INVALID_QUANTITY: HttpStatus.BAD_REQUEST,
  TOO_MANY_ORDER_ITEMS: HttpStatus.UNPROCESSABLE_ENTITY,
  ORDER_ITEM_NOT_FOUND: HttpStatus.NOT_FOUND,
  ORDER_NOT_EDITABLE: HttpStatus.CONFLICT,
  EMPTY_ORDER: HttpStatus.UNPROCESSABLE_ENTITY,
  INVALID_ORDER_TRANSITION: HttpStatus.CONFLICT,
  INVALID_COUPON_CODE: HttpStatus.BAD_REQUEST,
  INVALID_DISCOUNT: HttpStatus.BAD_REQUEST,
  COUPON_NOT_APPLICABLE: HttpStatus.UNPROCESSABLE_ENTITY,
  COUPON_ALREADY_APPLIED: HttpStatus.CONFLICT,
  ORDER_NOT_FOUND: HttpStatus.NOT_FOUND,
  PRODUCT_UNAVAILABLE: HttpStatus.UNPROCESSABLE_ENTITY,
  COUPON_NOT_FOUND: HttpStatus.NOT_FOUND,
  COUPON_CODE_IN_USE: HttpStatus.CONFLICT,
} as const satisfies ErrorStatusMap;
