import type { StockItem } from '../domain/stock-item.entity.js';

export type StockOutput = {
  sku: string;
  onHand: number;
  reserved: number;
  available: number;
  minimumLevel: number;
  belowMinimum: boolean;
};

export function toStockOutput(stockItem: StockItem): StockOutput {
  const { sku, onHand, reserved, minimumLevel } = stockItem.toSnapshot();
  return {
    sku,
    onHand,
    reserved,
    available: stockItem.available().toNumber(),
    minimumLevel,
    belowMinimum: stockItem.isBelowMinimum(),
  };
}
