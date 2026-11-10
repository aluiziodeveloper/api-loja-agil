import { UniqueId } from '../../../shared/domain/unique-id.value-object.js';
import { anOrder } from '../../domain/__tests__/order.builder.js';
import { OrderStatus } from '../../domain/order-status.js';
import { InMemoryOrderRepository } from '../__tests__/in-memory-order.repository.js';
import { CancelOrderUseCase } from './cancel-order.use-case.js';
import { PayOrderUseCase } from './pay-order.use-case.js';
import { PlaceOrderUseCase } from './place-order.use-case.js';
import { ShipOrderUseCase } from './ship-order.use-case.js';

const ORDER_ID = '01890a5d-ac96-774b-bcce-b302099a8058';

type LifecycleUseCase = {
  execute(input: { orderId: string }): Promise<{ status: string }>;
};

describe('order lifecycle use cases', () => {
  let orders: InMemoryOrderRepository;

  beforeEach(() => {
    orders = new InMemoryOrderRepository();
  });

  async function storedOrder(status: OrderStatus): Promise<void> {
    await orders.save(anOrder().withId(ORDER_ID).withStatus(status).build());
  }

  it.each([
    {
      useCase: PlaceOrderUseCase,
      from: OrderStatus.DRAFT,
      to: OrderStatus.PLACED,
    },
    {
      useCase: PayOrderUseCase,
      from: OrderStatus.PLACED,
      to: OrderStatus.PAID,
    },
    {
      useCase: ShipOrderUseCase,
      from: OrderStatus.PAID,
      to: OrderStatus.SHIPPED,
    },
    {
      useCase: CancelOrderUseCase,
      from: OrderStatus.PLACED,
      to: OrderStatus.CANCELLED,
    },
  ])(
    '$useCase.name should take an order from $from to $to',
    async ({ useCase, from, to }) => {
      await storedOrder(from);
      const lifecycle: LifecycleUseCase = new useCase(orders);

      const output = await lifecycle.execute({ orderId: ORDER_ID });

      expect(output.status).toBe(to);
      const stored = await orders.findById(UniqueId.from(ORDER_ID));
      expect(stored?.toSnapshot().status).toBe(to);
    },
  );

  it('should refuse a transition outside the lifecycle', async () => {
    await storedOrder(OrderStatus.SHIPPED);

    await expect(
      new CancelOrderUseCase(orders).execute({ orderId: ORDER_ID }),
    ).rejects.toThrow(
      expect.objectContaining({ code: 'INVALID_ORDER_TRANSITION' }),
    );
  });

  it('should refuse to place an empty order', async () => {
    await orders.save(anOrder().withId(ORDER_ID).withItems().build());

    await expect(
      new PlaceOrderUseCase(orders).execute({ orderId: ORDER_ID }),
    ).rejects.toThrow(expect.objectContaining({ code: 'EMPTY_ORDER' }));
  });
});
