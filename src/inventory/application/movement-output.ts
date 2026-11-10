import type {
  StockMovement,
  StockMovementType,
} from '../domain/stock-movement.js';

export type MovementOutput = {
  type: StockMovementType;
  onHandChange: number;
  reservedChange: number;
  reason: string | null;
  occurredAt: string;
};

export function toMovementOutput(movement: StockMovement): MovementOutput {
  return { ...movement, occurredAt: movement.occurredAt.toISOString() };
}
