import { z } from 'zod';
import type { CouponOutput } from '../../application/coupon-output.js';
import type { OrderOutput } from '../../application/order-output.js';
import { OrderStatus } from '../../domain/order-status.js';

const orderItemResponse = z.object({
  sku: z.string(),
  unitPriceInCents: z.number().int(),
  quantity: z.number().int(),
  subtotalInCents: z.number().int(),
});

/** O pedido como a API mostra: itens, cupom e os três valores já calculados. */
export const orderResponse = z.object({
  id: z.uuid(),
  customerId: z.uuid(),
  status: z.enum(OrderStatus),
  items: z.array(orderItemResponse),
  couponCode: z.string().nullable(),
  subtotalInCents: z.number().int(),
  discountInCents: z.number().int(),
  totalInCents: z.number().int(),
  createdAt: z.iso.datetime(),
});

export const couponResponse = z.object({
  code: z.string(),
  discount: z.discriminatedUnion('type', [
    z.object({
      type: z.literal('PERCENTAGE'),
      percent: z.number(),
      capInCents: z.number().int(),
    }),
    z.object({
      type: z.literal('FIXED_AMOUNT'),
      amountInCents: z.number().int(),
    }),
  ]),
  minimumOrderInCents: z.number().int(),
  expiresAt: z.iso.datetime(),
});

export type OrderResponse = z.infer<typeof orderResponse>;
export type CouponResponse = z.infer<typeof couponResponse>;

export function presentOrder(order: OrderOutput): OrderResponse {
  return orderResponse.parse(order);
}

export function presentCoupon(coupon: CouponOutput): CouponResponse {
  return couponResponse.parse(coupon);
}
