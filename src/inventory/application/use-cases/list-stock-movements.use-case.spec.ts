import { aStockItem } from '../../domain/__tests__/stock-item.builder.js';
import { AdjustmentReason } from '../../domain/adjustment-reason.value-object.js';
import { StockQuantity } from '../../domain/stock-quantity.value-object.js';
import { StockItemNotFoundError } from '../errors/stock-item-not-found.error.js';
import { InMemoryStockItemRepository } from '../__tests__/in-memory-stock-item.repository.js';
import { ListStockMovementsUseCase } from './list-stock-movements.use-case.js';

const NOW = new Date('2026-11-10T12:00:00.000Z');

describe('ListStockMovementsUseCase', () => {
  let stockItems: InMemoryStockItemRepository;
  let listMovements: ListStockMovementsUseCase;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    stockItems = new InMemoryStockItemRepository();
    listMovements = new ListStockMovementsUseCase(stockItems);
    const mug = aStockItem().withSku('CAN001').withOnHand(10).build();
    mug.receive(StockQuantity.of(5));
    mug.adjust(StockQuantity.of(14), AdjustmentReason.create('Avaria'));
    await stockItems.save(mug);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should list the movements of a SKU in chronological order', async () => {
    const output = await listMovements.execute({ sku: 'can001' });

    expect(output).toEqual({
      items: [
        {
          type: 'RECEIPT',
          onHandChange: 5,
          reservedChange: 0,
          reason: null,
          occurredAt: '2026-11-10T12:00:00.000Z',
        },
        {
          type: 'ADJUSTMENT',
          onHandChange: -1,
          reservedChange: 0,
          reason: 'Avaria',
          occurredAt: '2026-11-10T12:00:00.000Z',
        },
      ],
      total: 2,
      page: 1,
      perPage: 15,
      lastPage: 1,
    });
  });

  it('should page the movements, newest first when asked', async () => {
    const output = await listMovements.execute({
      sku: 'CAN001',
      sortDirection: 'desc',
      perPage: 1,
    });

    expect(output.items.map((movement) => movement.type)).toEqual([
      'ADJUSTMENT',
    ]);
    expect(output).toMatchObject({ total: 2, lastPage: 2 });
  });

  it('should reject an unknown SKU', async () => {
    await expect(listMovements.execute({ sku: 'NADA01' })).rejects.toThrow(
      StockItemNotFoundError,
    );
  });
});
