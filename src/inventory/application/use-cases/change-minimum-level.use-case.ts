import type { UseCase } from '../../../shared/application/use-case.js';
import { StockQuantity } from '../../domain/stock-quantity.value-object.js';
import { loadStockItem } from '../load-stock-item.js';
import type { StockItemRepository } from '../ports/stock-item.repository.js';
import { toStockOutput, type StockOutput } from '../stock-output.js';

export type ChangeMinimumLevelInput = {
  sku: string;
  minimumLevel: number;
};

export class ChangeMinimumLevelUseCase implements UseCase<
  ChangeMinimumLevelInput,
  StockOutput
> {
  constructor(private readonly stockItems: StockItemRepository) {}

  async execute(input: ChangeMinimumLevelInput): Promise<StockOutput> {
    const minimumLevel = StockQuantity.of(input.minimumLevel);
    const stockItem = await loadStockItem(this.stockItems, input.sku);

    stockItem.changeMinimumLevel(minimumLevel);
    await this.stockItems.save(stockItem);
    return toStockOutput(stockItem);
  }
}
