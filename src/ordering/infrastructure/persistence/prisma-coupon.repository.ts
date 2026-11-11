import type { PrismaDatabase } from '../../../shared/infrastructure/database/prisma-database.js';
import type { CouponRepository } from '../../application/ports/coupon.repository.js';
import type { CouponCode } from '../../domain/coupon/coupon-code.value-object.js';
import { Coupon } from '../../domain/coupon/coupon.entity.js';
import type { DiscountSnapshot } from '../../domain/coupon/coupon.snapshot.js';

export class PrismaCouponRepository implements CouponRepository {
  constructor(private readonly database: PrismaDatabase) {}

  async save(coupon: Coupon): Promise<void> {
    const { id, ...data } = coupon.toSnapshot();
    await this.database.client().coupon.upsert({
      where: { id },
      create: { id, ...data },
      update: data,
    });
  }

  /**
   * O JSON do desconto foi escrito por este repositório; o `restore` do cupom
   * valida os valores de novo ao montar a política.
   */
  async findByCode(code: CouponCode): Promise<Coupon | null> {
    const row = await this.database
      .client()
      .coupon.findUnique({ where: { code: code.toString() } });
    if (!row) {
      return null;
    }
    return Coupon.restore({
      ...row,
      discount: row.discount as DiscountSnapshot,
    });
  }
}
