import { Sku } from '../../../shared/domain/sku.value-object.js';
import { aStockItem } from '../../domain/__tests__/stock-item.builder.js';
import { AdjustmentReason } from '../../domain/adjustment-reason.value-object.js';
import { StockMovementType } from '../../domain/stock-movement.js';
import { StockQuantity } from '../../domain/stock-quantity.value-object.js';
import { movementSearchParams } from '../movement-search.js';
import type { StockItemRepository } from '../ports/stock-item.repository.js';

const MUG = Sku.create('CAN001');

/**
 * O comportamento que toda implementação de `StockItemRepository` precisa ter:
 * estado e histórico gravados juntos, e o histórico só cresce (D18).
 */
export function stockItemRepositoryContract(
  createRepository: () => Promise<StockItemRepository>,
): void {
  let stockItems: StockItemRepository;

  beforeEach(async () => {
    stockItems = await createRepository();
  });

  async function historyOf(sku: Sku, direction?: string, perPage?: number) {
    const result = await stockItems.findMovements(
      sku,
      movementSearchParams({ sortDirection: direction, perPage }),
    );
    return result.toOutput();
  }

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

  it('should append the pending movements when saving, only once', async () => {
    const stock = aStockItem().withSku('CAN001').build();
    stock.receive(StockQuantity.of(5));
    stock.reserve(StockQuantity.of(2));

    await stockItems.save(stock);
    await stockItems.save(stock);

    const history = await historyOf(MUG);
    expect(history.items.map((movement) => movement.type)).toEqual([
      StockMovementType.RECEIPT,
      StockMovementType.RESERVATION,
    ]);
    expect(history.total).toBe(2);
  });

  it('should give back exactly the movement that was saved', async () => {
    const stock = aStockItem().withSku('CAN001').withOnHand(10).build();
    stock.adjust(StockQuantity.of(7), AdjustmentReason.create('Avaria'));
    await stockItems.save(stock);

    const [stored] = (await historyOf(MUG)).items;

    expect(stored).toEqual({
      type: StockMovementType.ADJUSTMENT,
      onHandChange: -3,
      reservedChange: 0,
      reason: 'Avaria',
      occurredAt: expect.any(Date),
    });
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

    const history = await historyOf(MUG, 'desc', 2);

    expect(history.items.map((movement) => movement.onHandChange)).toEqual([
      3, 2,
    ]);
    expect(history).toMatchObject({ total: 3, lastPage: 2 });
  });
}
