import { Prisma } from '../../../generated/prisma/client.js';
import type { OrderGetPayload } from '../../../generated/prisma/models/Order.js';
import type { CouponSnapshot } from '../../domain/coupon/coupon.snapshot.js';
import type { OrderSnapshot } from '../../domain/order.snapshot.js';

export const WITH_ITEMS = {
  items: { orderBy: { position: 'asc' } },
} as const satisfies Prisma.OrderInclude;

type OrderRow = OrderGetPayload<{ include: typeof WITH_ITEMS }>;

/** No JSON, a validade do cupom vira texto; na volta, vira `Date` de novo. */
type StoredCoupon = Omit<CouponSnapshot, 'expiresAt'> & { expiresAt: string };

function couponToJson(
  coupon: CouponSnapshot | null,
): Prisma.InputJsonValue | typeof Prisma.DbNull {
  return coupon
    ? { ...coupon, expiresAt: coupon.expiresAt.toISOString() }
    : Prisma.DbNull;
}

function couponFromJson(json: Prisma.JsonValue): CouponSnapshot | null {
  if (json === null) {
    return null;
  }
  const stored = json as StoredCoupon;
  return { ...stored, expiresAt: new Date(stored.expiresAt) };
}

/** Do snapshot para as colunas de `orders`, sem o id e sem os itens. */
export function orderColumns(snapshot: OrderSnapshot) {
  const { customerId, status, createdAt, coupon } = snapshot;
  return { customerId, status, createdAt, coupon: couponToJson(coupon) };
}

/** Do snapshot para as linhas de `order_items`, na ordem em que entraram. */
export function itemRows({ items }: OrderSnapshot) {
  return items.map((item, position) => ({ position, ...item }));
}

/** Da linha, com os itens, de volta para o snapshot. */
export function toOrderSnapshot(row: OrderRow): OrderSnapshot {
  return {
    id: row.id,
    customerId: row.customerId,
    status: row.status,
    items: row.items.map(({ sku, unitPriceInCents, quantity }) => ({
      sku,
      unitPriceInCents,
      quantity,
    })),
    coupon: couponFromJson(row.coupon),
    createdAt: row.createdAt,
  };
}
