import { Money } from '../../shared/domain/money.value-object.js';
import type { Sku } from '../../shared/domain/sku.value-object.js';
import { CouponAlreadyAppliedError } from './coupon/coupon-already-applied.error.js';
import { CouponNotApplicableError } from './coupon/coupon-not-applicable.error.js';
import { Coupon } from './coupon/coupon.entity.js';
import type { CouponSnapshot } from './coupon/coupon.snapshot.js';
import { EmptyOrderError } from './empty-order.error.js';
import type {
  OrderItemSnapshot,
  OrderItem,
} from './order-item.value-object.js';
import { OrderItems } from './order-items.js';

export type OrderPrices = {
  subtotal: Money;
  discount: Money;
  total: Money;
};

export type BasketSnapshot = {
  items: OrderItemSnapshot[];
  coupon: CouponSnapshot | null;
};

/** O que o pedido compra e por quanto: itens, cupom e valores. Imutável. */
export class Basket {
  private constructor(
    private readonly items: OrderItems,
    private readonly coupon: Coupon | null,
  ) {}

  static empty(): Basket {
    return new Basket(OrderItems.empty(), null);
  }

  static restore(snapshot: BasketSnapshot): Basket {
    return new Basket(
      OrderItems.restore(snapshot.items),
      snapshot.coupon && Coupon.restore(snapshot.coupon),
    );
  }

  add(item: OrderItem): Basket {
    return new Basket(this.items.add(item), this.coupon);
  }

  remove(sku: Sku): Basket {
    return new Basket(this.items.remove(sku), this.coupon);
  }

  /** Um cupom por pedido (RN14), e só se o pedido já for elegível. */
  withCoupon(coupon: Coupon, at: Date): Basket {
    if (this.coupon) {
      throw new CouponAlreadyAppliedError(this.coupon.code().toString());
    }
    coupon.discountFor(this.subtotal(), at);
    return new Basket(this.items, coupon);
  }

  withoutCoupon(): Basket {
    return new Basket(this.items, null);
  }

  ensureReadyToPlace(at: Date): void {
    if (this.items.isEmpty()) {
      throw new EmptyOrderError();
    }
    if (this.coupon && !this.coupon.isApplicableTo(this.subtotal(), at)) {
      throw new CouponNotApplicableError(this.coupon.code().toString());
    }
  }

  prices(at: Date): OrderPrices {
    const subtotal = this.subtotal();
    const discount = this.discountFor(subtotal, at);
    return { subtotal, discount, total: subtotal.subtract(discount) };
  }

  toSnapshot(): BasketSnapshot {
    return {
      items: this.items.toSnapshot(),
      coupon: this.coupon?.toSnapshot() ?? null,
    };
  }

  private subtotal(): Money {
    return this.items.subtotal();
  }

  /** Sem cupom, ou com um cupom que deixou de valer, o desconto é zero. */
  private discountFor(subtotal: Money, at: Date): Money {
    if (!this.coupon?.isApplicableTo(subtotal, at)) {
      return Money.zero();
    }
    return this.coupon.discountFor(subtotal, at);
  }
}
