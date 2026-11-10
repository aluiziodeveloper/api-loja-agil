import { AggregateRoot } from '../../../shared/domain/aggregate-root.js';
import { Money } from '../../../shared/domain/money.value-object.js';
import { UniqueId } from '../../../shared/domain/unique-id.value-object.js';
import { allOf, type Specification } from '../specification.js';
import type { CouponCandidate } from './coupon-candidate.js';
import { CouponCode } from './coupon-code.value-object.js';
import { CouponNotApplicableError } from './coupon-not-applicable.error.js';
import type { CouponSnapshot } from './coupon.snapshot.js';
import type { DiscountPolicy } from './discount-policy.js';
import { discountPolicyFrom } from './discount-policy.factory.js';
import { MinimumOrderValue } from './minimum-order-value.rule.js';
import { ValidUntil } from './valid-until.rule.js';

type CouponProps = {
  code: CouponCode;
  discount: DiscountPolicy;
  minimumOrder: Money;
  expiresAt: Date;
};

export class Coupon extends AggregateRoot {
  private constructor(
    id: UniqueId,
    private readonly props: CouponProps,
  ) {
    super(id);
  }

  static create(props: CouponProps): Coupon {
    return new Coupon(UniqueId.create(), props);
  }

  static restore(snapshot: CouponSnapshot): Coupon {
    return new Coupon(UniqueId.from(snapshot.id), {
      code: CouponCode.create(snapshot.code),
      discount: discountPolicyFrom(snapshot.discount),
      minimumOrder: Money.fromCents(snapshot.minimumOrderInCents),
      expiresAt: snapshot.expiresAt,
    });
  }

  isApplicableTo(subtotal: Money, at: Date): boolean {
    return this.eligibility().isSatisfiedBy({ subtotal, at });
  }

  /** Specification decide se vale; Strategy decide quanto vale. */
  discountFor(subtotal: Money, at: Date): Money {
    if (!this.isApplicableTo(subtotal, at)) {
      throw new CouponNotApplicableError(this.props.code.toString());
    }
    return this.props.discount.discountFor(subtotal);
  }

  toSnapshot(): CouponSnapshot {
    return {
      id: this.id.toString(),
      code: this.props.code.toString(),
      discount: this.props.discount.toSnapshot(),
      minimumOrderInCents: this.props.minimumOrder.toCents(),
      expiresAt: this.props.expiresAt,
    };
  }

  private eligibility(): Specification<CouponCandidate> {
    return allOf<CouponCandidate>(
      new MinimumOrderValue(this.props.minimumOrder),
      new ValidUntil(this.props.expiresAt),
    );
  }
}
