import { z } from 'zod';
import type { MovementOutput } from '../../application/movement-output.js';
import type { StockOutput } from '../../application/stock-output.js';
import { StockMovementType } from '../../domain/stock-movement.js';

/** O nível de estoque de um SKU, com o que está livre para vender. */
export const stockResponse = z.object({
  sku: z.string(),
  onHand: z.number().int(),
  reserved: z.number().int(),
  available: z.number().int(),
  minimumLevel: z.number().int(),
  belowMinimum: z.boolean(),
});

/** Uma linha do histórico: o que mudou, por quê e quando. */
export const movementResponse = z.object({
  type: z.enum(StockMovementType),
  onHandChange: z.number().int(),
  reservedChange: z.number().int(),
  reason: z.string().nullable(),
  occurredAt: z.iso.datetime(),
});

export type StockResponse = z.infer<typeof stockResponse>;
export type MovementResponse = z.infer<typeof movementResponse>;

export function presentStock(stock: StockOutput): StockResponse {
  return stockResponse.parse(stock);
}

export function presentMovement(movement: MovementOutput): MovementResponse {
  return movementResponse.parse(movement);
}
