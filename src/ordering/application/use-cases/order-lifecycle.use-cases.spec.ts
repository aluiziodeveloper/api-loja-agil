import { EventDispatcher } from '../../../shared/application/events/event-dispatcher.js';
import { InMemoryTransaction } from '../../../shared/application/__tests__/in-memory-transaction.js';
import { UniqueId } from '../../../shared/domain/unique-id.value-object.js';
import { anOrder } from '../../domain/__tests__/order.builder.js';
import { OrderStatus } from '../../domain/order-status.js';
import { InMemoryOrderRepository } from '../__tests__/in-memory-order.repository.js';
import type { OrderLifecycleDeps } from '../transition-order.js';
import { CancelOrderUseCase } from './cancel-order.use-case.js';
import { PayOrderUseCase } from './pay-order.use-case.js';
import { PlaceOrderUseCase } from './place-order.use-case.js';
import { ShipOrderUseCase } from './ship-order.use-case.js';

const ORDER_ID = '01890a5d-ac96-774b-bcce-b302099a8058';
const ANA = '01890a5d-ac96-774b-bcce-b302099a8057';
const BRUNO = '01890a5d-ac96-774b-bcce-b302099a8056';

type LifecycleUseCase = {
  execute(input: {
    orderId: string;
    customerId: string;
  }): Promise<{ status: string }>;
};

describe('order lifecycle use cases', () => {
  let orders: InMemoryOrderRepository;
  let events: EventDispatcher;
  let deps: OrderLifecycleDeps;

  beforeEach(() => {
    orders = new InMemoryOrderRepository();
    events = new EventDispatcher();
    deps = { orders, events, transaction: new InMemoryTransaction([orders]) };
  });

  async function storedOrder(status: OrderStatus): Promise<void> {
    await orders.save(
      anOrder().withId(ORDER_ID).withCustomerId(ANA).withStatus(status).build(),
    );
  }

  async function storedStatus(): Promise<OrderStatus | undefined> {
    const stored = await orders.findById(UniqueId.from(ORDER_ID));
    return stored?.toSnapshot().status;
  }

  it.each([
    {
      useCase: PlaceOrderUseCase,
      from: OrderStatus.DRAFT,
      to: OrderStatus.PLACED,
      event: 'OrderPlaced',
    },
    {
      useCase: PayOrderUseCase,
      from: OrderStatus.PLACED,
      to: OrderStatus.PAID,
      event: 'OrderPaid',
    },
    {
      useCase: ShipOrderUseCase,
      from: OrderStatus.PAID,
      to: OrderStatus.SHIPPED,
      event: 'OrderShipped',
    },
    {
      useCase: CancelOrderUseCase,
      from: OrderStatus.PLACED,
      to: OrderStatus.CANCELLED,
      event: 'OrderCancelled',
    },
  ])(
    '$useCase.name should take an order from $from to $to and publish $event',
    async ({ useCase, from, to, event }) => {
      await storedOrder(from);
      const published: string[] = [];
      events.subscribe(event, {
        handle: async (received) => {
          published.push(received.aggregateId);
        },
      });
      const lifecycle: LifecycleUseCase = new useCase(deps);

      const output = await lifecycle.execute({
        orderId: ORDER_ID,
        customerId: ANA,
      });

      expect(output.status).toBe(to);
      expect(await storedStatus()).toBe(to);
      expect(published).toEqual([ORDER_ID]);
    },
  );

  it('should leave the order as it was when a handler fails', async () => {
    await storedOrder(OrderStatus.DRAFT);
    const failure = new Error('sem estoque');
    events.subscribe('OrderPlaced', {
      handle: async () => Promise.reject(failure),
    });

    await expect(
      new PlaceOrderUseCase(deps).execute({
        orderId: ORDER_ID,
        customerId: ANA,
      }),
    ).rejects.toBe(failure);
    expect(await storedStatus()).toBe(OrderStatus.DRAFT);
  });

  it('should refuse a transition outside the lifecycle', async () => {
    await storedOrder(OrderStatus.SHIPPED);

    await expect(
      new CancelOrderUseCase(deps).execute({
        orderId: ORDER_ID,
        customerId: ANA,
      }),
    ).rejects.toThrow(
      expect.objectContaining({ code: 'INVALID_ORDER_TRANSITION' }),
    );
  });

  it('should refuse to place an empty order', async () => {
    await orders.save(
      anOrder().withId(ORDER_ID).withCustomerId(ANA).withItems().build(),
    );

    await expect(
      new PlaceOrderUseCase(deps).execute({
        orderId: ORDER_ID,
        customerId: ANA,
      }),
    ).rejects.toThrow(expect.objectContaining({ code: 'EMPTY_ORDER' }));
  });

  it.each([
    { useCase: PlaceOrderUseCase, from: OrderStatus.DRAFT },
    { useCase: PayOrderUseCase, from: OrderStatus.PLACED },
    { useCase: CancelOrderUseCase, from: OrderStatus.PLACED },
  ])(
    '$useCase.name should not touch the order of another customer (RN15)',
    async ({ useCase, from }) => {
      await storedOrder(from);
      const lifecycle: LifecycleUseCase = new useCase(deps);

      await expect(
        lifecycle.execute({ orderId: ORDER_ID, customerId: BRUNO }),
      ).rejects.toThrow(expect.objectContaining({ code: 'ORDER_NOT_FOUND' }));
      expect(await storedStatus()).toBe(from);
    },
  );

  it('should let the store ship the order of any customer', async () => {
    await storedOrder(OrderStatus.PAID);

    const output = await new ShipOrderUseCase(deps).execute({
      orderId: ORDER_ID,
    });

    expect(output.status).toBe(OrderStatus.SHIPPED);
  });
});
