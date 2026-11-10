export type DiscountSnapshot =
  | { type: 'PERCENTAGE'; percent: number; capInCents: number }
  | { type: 'FIXED_AMOUNT'; amountInCents: number };

/** Estado de um cupom em primitivos: o contrato com a borda. */
export type CouponSnapshot = {
  id: string;
  code: string;
  discount: DiscountSnapshot;
  minimumOrderInCents: number;
  expiresAt: Date;
};
