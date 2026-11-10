import type { UseCase } from '../../../shared/application/use-case.js';
import { Sku } from '../../../shared/domain/sku.value-object.js';
import { StockItem } from '../../domain/stock-item.entity.js';
import { StockQuantity } from '../../domain/stock-quantity.value-object.js';
import type { StockItemRepository } from '../ports/stock-item.repository.js';
import { toStockOutput, type StockOutput } from '../stock-output.js';

export type ReceiveStockInput = {
  sku: string;
  quantity: number;
};

/** Dá entrada no estoque; a primeira entrada de um SKU cria o item. */
export class ReceiveStockUseCase implements UseCase<
  ReceiveStockInput,
  StockOutput
> {
  constructor(private readonly stockItems: StockItemRepository) {}

  async execute(input: ReceiveStockInput): Promise<StockOutput> {
    const sku = Sku.create(input.sku);
    const quantity = StockQuantity.of(input.quantity);
    const stockItem =
      (await this.stockItems.findBySku(sku)) ??
      StockItem.create(sku, StockQuantity.zero());

    stockItem.receive(quantity);
    await this.stockItems.save(stockItem);
    return toStockOutput(stockItem);
  }
}
