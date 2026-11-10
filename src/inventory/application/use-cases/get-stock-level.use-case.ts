import type { UseCase } from '../../../shared/application/use-case.js';
import { loadStockItem } from '../load-stock-item.js';
import type { StockItemRepository } from '../ports/stock-item.repository.js';
import { toStockOutput, type StockOutput } from '../stock-output.js';

export type GetStockLevelInput = {
  sku: string;
};

export class GetStockLevelUseCase implements UseCase<
  GetStockLevelInput,
  StockOutput
> {
  constructor(private readonly stockItems: StockItemRepository) {}

  async execute(input: GetStockLevelInput): Promise<StockOutput> {
    const stockItem = await loadStockItem(this.stockItems, input.sku);
    return toStockOutput(stockItem);
  }
}
