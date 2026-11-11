import { Sku } from '../../../shared/domain/sku.value-object.js';
import { aStockItem } from '../../domain/__tests__/stock-item.builder.js';
import { StockMovementType } from '../../domain/stock-movement.js';
import { StockQuantity } from '../../domain/stock-quantity.value-object.js';
import { movementSearchParams } from '../movement-search.js';
import { InMemoryStockItemRepository } from './in-memory-stock-item.repository.js';

const MUG = Sku.create('CAN001');

describe('InMemoryStockItemRepository', () => {
  let stockItems: InMemoryStockItemRepository;

  beforeEach(() => {
    stockItems = new InMemoryStockItemRepository();
  });

  it('should find a saved item by SKU, as a new instance', async () => {
    const stock = aStockItem().withSku('CAN001').build();
    await stockItems.save(stock);

    const found = await stockItems.findBySku(MUG);

    expect(found).not.toBe(stock);
    expect(found?.toSnapshot()).toEqual(stock.toSnapshot());
    expect(await stockItems.findBySku(Sku.create('NADA01'))).toBeNull();
  });

  it('should only keep changes after they are saved', async () => {
    const stock = aStockItem().withSku('CAN001').withOnHand(10).build();
    await stockItems.save(stock);

    stock.receive(StockQuantity.of(5));
    const beforeSave = await stockItems.findBySku(MUG);
    await stockItems.save(stock);
    const afterSave = await stockItems.findBySku(MUG);

    expect(beforeSave?.toSnapshot().onHand).toBe(10);
    expect(afterSave?.toSnapshot().onHand).toBe(15);
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

  it('should append the pending movements when saving, only once', async () => {
    const stock = aStockItem().withSku('CAN001').build();
    stock.receive(StockQuantity.of(5));
    stock.reserve(StockQuantity.of(2));

    await stockItems.save(stock);
    await stockItems.save(stock);

    const result = await stockItems.findMovements(
      MUG,
      movementSearchParams({}),
    );
    expect(result.toOutput().items.map((movement) => movement.type)).toEqual([
      StockMovementType.RECEIPT,
      StockMovementType.RESERVATION,
    ]);
    expect(result.toOutput().total).toBe(2);
  });

  it('should page the movements of one SKU, newest first when asked', async () => {
    const mug = aStockItem().withSku('CAN001').build();
    const shirt = aStockItem().withSku('CAM001').build();
    mug.receive(StockQuantity.of(1));
    mug.receive(StockQuantity.of(2));
    mug.receive(StockQuantity.of(3));
    shirt.receive(StockQuantity.of(9));
    await stockItems.save(mug);
    await stockItems.save(shirt);

    const result = await stockItems.findMovements(
      MUG,
      movementSearchParams({ sortDirection: 'desc', perPage: 2 }),
    );

    expect(
      result.toOutput().items.map((movement) => movement.onHandChange),
    ).toEqual([3, 2]);
    expect(result.toOutput()).toMatchObject({ total: 3, lastPage: 2 });
  });
});
