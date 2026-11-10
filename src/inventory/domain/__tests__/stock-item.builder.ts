import { faker } from '@faker-js/faker';

import { UniqueId } from '../../../shared/domain/unique-id.value-object.js';
import { StockItem } from '../stock-item.entity.js';
import type { StockItemSnapshot } from '../stock-item.snapshot.js';

export class StockItemBuilder {
  private snapshot: StockItemSnapshot = {
    id: UniqueId.create().toString(),
    sku: faker.string.alphanumeric({ length: 8, casing: 'upper' }),
    onHand: faker.number.int({ min: 50, max: 500 }),
    reserved: 0,
    minimumLevel: faker.number.int({ min: 0, max: 20 }),
  };

  withSku(sku: string): this {
    return this.with({ sku });
  }

  withOnHand(onHand: number): this {
    return this.with({ onHand });
  }

  withReserved(reserved: number): this {
    return this.with({ reserved });
  }

  withMinimumLevel(minimumLevel: number): this {
    return this.with({ minimumLevel });
  }

  build(): StockItem {
    return StockItem.restore(this.snapshot);
  }

  private with(changes: Partial<StockItemSnapshot>): this {
    this.snapshot = { ...this.snapshot, ...changes };
    return this;
  }
}

export function aStockItem(): StockItemBuilder {
  return new StockItemBuilder();
}
