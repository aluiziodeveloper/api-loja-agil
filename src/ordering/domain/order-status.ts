export const OrderStatus = {
  DRAFT: 'DRAFT',
  PLACED: 'PLACED',
  PAID: 'PAID',
  SHIPPED: 'SHIPPED',
  CANCELLED: 'CANCELLED',
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];
