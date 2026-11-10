import type { SearchParamsInput } from '../../../shared/application/search/search-params.js';
import type { SearchOutput } from '../../../shared/application/search/search-result.js';
import type { UseCase } from '../../../shared/application/use-case.js';
import { Sku } from '../../../shared/domain/sku.value-object.js';
import { loadStockItem } from '../load-stock-item.js';
import { movementSearchParams } from '../movement-search.js';
import { toMovementOutput, type MovementOutput } from '../movement-output.js';
import type { StockItemRepository } from '../ports/stock-item.repository.js';

export type ListStockMovementsInput = Pick<
  SearchParamsInput,
  'page' | 'perPage' | 'sortDirection'
> & {
  sku: string;
};

export class ListStockMovementsUseCase implements UseCase<
  ListStockMovementsInput,
  SearchOutput<MovementOutput>
> {
  constructor(private readonly stockItems: StockItemRepository) {}

  async execute({
    sku,
    ...input
  }: ListStockMovementsInput): Promise<SearchOutput<MovementOutput>> {
    const params = movementSearchParams(input);
    await loadStockItem(this.stockItems, sku);
    const result = await this.stockItems.findMovements(Sku.create(sku), params);
    return result.map(toMovementOutput).toOutput();
  }
}
