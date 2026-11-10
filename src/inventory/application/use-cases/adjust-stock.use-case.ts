import type { UseCase } from '../../../shared/application/use-case.js';
import { AdjustmentReason } from '../../domain/adjustment-reason.value-object.js';
import { StockQuantity } from '../../domain/stock-quantity.value-object.js';
import { loadStockItem } from '../load-stock-item.js';
import type { StockItemRepository } from '../ports/stock-item.repository.js';
import { toStockOutput, type StockOutput } from '../stock-output.js';

export type AdjustStockInput = {
  sku: string;
  countedQuantity: number;
  reason: string;
};

export class AdjustStockUseCase implements UseCase<
  AdjustStockInput,
  StockOutput
> {
  constructor(private readonly stockItems: StockItemRepository) {}

  async execute(input: AdjustStockInput): Promise<StockOutput> {
    const counted = StockQuantity.of(input.countedQuantity);
    const reason = AdjustmentReason.create(input.reason);
    const stockItem = await loadStockItem(this.stockItems, input.sku);

    stockItem.adjust(counted, reason);
    await this.stockItems.save(stockItem);
    return toStockOutput(stockItem);
  }
}
