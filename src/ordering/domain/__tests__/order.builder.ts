import { faker } from '@faker-js/faker';

import { UniqueId } from '../../../shared/domain/unique-id.value-object.js';
import type { CouponSnapshot } from '../coupon/coupon.snapshot.js';
import { Order } from '../order.entity.js';
import type { OrderSnapshot } from '../order.snapshot.js';
import type { OrderStatus } from '../order-status.js';

export class OrderBuilder {
  private snapshot: OrderSnapshot = {
    id: UniqueId.create().toString(),
    customerId: UniqueId.create().toString(),
    status: 'DRAFT',
    items: [
      {
        sku: faker.string.alphanumeric({ length: 8, casing: 'upper' }),
        unitPriceInCents: faker.number.int({ min: 100, max: 100_000 }),
        quantity: faker.number.int({ min: 1, max: 5 }),
      },
    ],
    coupon: null,
    createdAt: new Date(),
  };

  withId(id: string): this {
    return this.with({ id });
  }

  withCustomerId(customerId: string): this {
    return this.with({ customerId });
  }

  withStatus(status: OrderStatus): this {
    return this.with({ status });
  }

  /** Substitui os itens; chame sem argumentos para um pedido vazio. */
  withItems(...items: OrderSnapshot['items']): this {
    return this.with({ items });
  }

  withCoupon(coupon: CouponSnapshot): this {
    return this.with({ coupon });
  }

  withCreatedAt(createdAt: Date): this {
    return this.with({ createdAt });
  }

  build(): Order {
    return Order.restore(this.snapshot);
  }

  private with(changes: Partial<OrderSnapshot>): this {
    this.snapshot = { ...this.snapshot, ...changes };
    return this;
  }
}

export function anOrder(): OrderBuilder {
  return new OrderBuilder();
}
