import { aCoupon } from '../../domain/__tests__/coupon.builder.js';
import { CouponCode } from '../../domain/coupon/coupon-code.value-object.js';
import { InMemoryCouponRepository } from '../__tests__/in-memory-coupon.repository.js';
import { CreateCouponUseCase } from './create-coupon.use-case.js';

const EXPIRES_AT = new Date('2026-11-30T23:59:59.999Z');

describe('CreateCouponUseCase', () => {
  let coupons: InMemoryCouponRepository;
  let createCoupon: CreateCouponUseCase;

  beforeEach(() => {
    coupons = new InMemoryCouponRepository();
    createCoupon = new CreateCouponUseCase(coupons);
  });

  it('should create a percentage coupon', async () => {
    const output = await createCoupon.execute({
      code: 'natal2026',
      discount: { type: 'PERCENTAGE', percent: 15, capInCents: 5000 },
      minimumOrderInCents: 10_000,
      expiresAt: EXPIRES_AT,
    });

    expect(output).toEqual({
      code: 'NATAL2026',
      discount: { type: 'PERCENTAGE', percent: 15, capInCents: 5000 },
      minimumOrderInCents: 10_000,
      expiresAt: '2026-11-30T23:59:59.999Z',
    });
    expect(
      await coupons.findByCode(CouponCode.create('NATAL2026')),
    ).not.toBeNull();
  });

  it('should refuse a code already in use', async () => {
    await coupons.save(aCoupon().withCode('NATAL2026').build());

    await expect(
      createCoupon.execute({
        code: 'NATAL2026',
        discount: { type: 'FIXED_AMOUNT', amountInCents: 1000 },
        minimumOrderInCents: 0,
        expiresAt: EXPIRES_AT,
      }),
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'COUPON_CODE_IN_USE',
        message: 'Já existe um cupom com o código "NATAL2026".',
      }),
    );
  });

  it('should refuse an invalid discount', async () => {
    await expect(
      createCoupon.execute({
        code: 'NATAL2026',
        discount: { type: 'PERCENTAGE', percent: 0, capInCents: 5000 },
        minimumOrderInCents: 0,
        expiresAt: EXPIRES_AT,
      }),
    ).rejects.toThrow(expect.objectContaining({ code: 'INVALID_DISCOUNT' }));
  });
});
