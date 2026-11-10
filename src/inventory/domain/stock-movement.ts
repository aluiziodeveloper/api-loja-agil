import type { StockLevelChange } from './stock-level.value-object.js';

export const StockMovementType = {
  RECEIPT: 'RECEIPT',
  ADJUSTMENT: 'ADJUSTMENT',
  RESERVATION: 'RESERVATION',
  RELEASE: 'RELEASE',
  COMMIT: 'COMMIT',
} as const;

export type StockMovementType =
  (typeof StockMovementType)[keyof typeof StockMovementType];

/** Registro imutável de uma mudança no estoque: o histórico só cresce. */
export type StockMovement = Readonly<{
  type: StockMovementType;
  onHandChange: number;
  reservedChange: number;
  reason: string | null;
  occurredAt: Date;
}>;

export function stockMovement(
  type: StockMovementType,
  change: StockLevelChange,
  reason?: string,
): StockMovement {
  return { type, ...change, reason: reason ?? null, occurredAt: new Date() };
}
