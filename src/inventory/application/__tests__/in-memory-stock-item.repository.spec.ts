import { Sku } from '../../../shared/domain/sku.value-object.js';
import { aStockItem } from '../../domain/__tests__/stock-item.builder.js';
import { StockQuantity } from '../../domain/stock-quantity.value-object.js';
import { movementSearchParams } from '../movement-search.js';
import { InMemoryStockItemRepository } from './in-memory-stock-item.repository.js';
import { stockItemRepositoryContract } from './stock-item-repository.contract.js';

const MUG = Sku.create('CAN001');

describe('InMemoryStockItemRepository', () => {
  stockItemRepositoryContract(async () => new InMemoryStockItemRepository());

  /** Só o fake: o rollback do banco de verdade é testado com a transação. */
  describe('checkpoint', () => {
    let stockItems: InMemoryStockItemRepository;

    beforeEach(() => {
      stockItems = new InMemoryStockItemRepository();
    });

    it('should go back to a checkpoint, history included', async () => {
      const stock = aStockItem().withSku('CAN001').withOnHand(10).build();
      await stockItems.save(stock);
      const rollback = stockItems.checkpoint();
      stock.reserve(StockQuantity.of(4));
      await stockItems.save(stock);

      rollback();

      expect((await stockItems.findBySku(MUG))?.toSnapshot().reserved).toBe(0);
      const history = await stockItems.findMovements(
        MUG,
        movementSearchParams({}),
      );
      expect(history.toOutput().total).toBe(0);
    });
  });
});
