import { anOrder } from '../../domain/__tests__/order.builder.js';
import { InMemoryOrderRepository } from './in-memory-order.repository.js';
import { orderRepositoryContract } from './order-repository.contract.js';

describe('InMemoryOrderRepository', () => {
  orderRepositoryContract(async () => new InMemoryOrderRepository());

  /** Só o fake: o rollback do banco de verdade é testado com a transação. */
  describe('checkpoint', () => {
    let orders: InMemoryOrderRepository;

    beforeEach(() => {
      orders = new InMemoryOrderRepository();
    });

    it('should go back to a checkpoint', async () => {
      const kept = anOrder().build();
      const undone = anOrder().build();
      await orders.save(kept);
      const rollback = orders.checkpoint();
      kept.place();
      await orders.save(kept);
      await orders.save(undone);

      rollback();

      expect((await orders.findById(kept.id))?.toSnapshot().status).toBe(
        'DRAFT',
      );
      expect(await orders.findById(undone.id)).toBeNull();
    });
  });
});
