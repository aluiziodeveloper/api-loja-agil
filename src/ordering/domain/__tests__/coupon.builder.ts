import { UniqueId } from '../../../shared/domain/unique-id.value-object.js';
import { Coupon } from '../coupon/coupon.entity.js';
import type { CouponSnapshot } from '../coupon/coupon.snapshot.js';

/** Longe o bastante para nenhum teste esbarrar na validade sem querer. */
const FAR_FUTURE = new Date('2099-12-31T23:59:59.999Z');

export class CouponBuilder {
  private snapshot: CouponSnapshot = {
    id: UniqueId.create().toString(),
    code: 'AGIL10',
    discount: { type: 'PERCENTAGE', percent: 10, capInCents: 2000 },
    minimumOrderInCents: 0,
    expiresAt: FAR_FUTURE,
  };

  withCode(code: string): this {
    return this.with({ code });
  }

  withPercentage(percent: number, capInCents: number): this {
    return this.with({ discount: { type: 'PERCENTAGE', percent, capInCents } });
  }

  withFixedAmount(amountInCents: number): this {
    return this.with({ discount: { type: 'FIXED_AMOUNT', amountInCents } });
  }

  withMinimumOrder(minimumOrderInCents: number): this {
    return this.with({ minimumOrderInCents });
  }

  withExpiresAt(expiresAt: Date): this {
    return this.with({ expiresAt });
  }

  build(): Coupon {
    return Coupon.restore(this.snapshot);
  }

  private with(changes: Partial<CouponSnapshot>): this {
    this.snapshot = { ...this.snapshot, ...changes };
    return this;
  }
}

export function aCoupon(): CouponBuilder {
  return new CouponBuilder();
}
