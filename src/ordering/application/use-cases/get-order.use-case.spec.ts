import { anOrder } from '../../domain/__tests__/order.builder.js';
import { InMemoryOrderRepository } from '../__tests__/in-memory-order.repository.js';
import { GetOrderUseCase } from './get-order.use-case.js';

const ORDER_ID = '01890a5d-ac96-774b-bcce-b302099a8058';
const ANA = '01890a5d-ac96-774b-bcce-b302099a8057';
const BRUNO = '01890a5d-ac96-774b-bcce-b302099a8056';

describe('GetOrderUseCase', () => {
  it('should return an order', async () => {
    const orders = new InMemoryOrderRepository();
    await orders.save(
      anOrder()
        .withId(ORDER_ID)
        .withCustomerId(ANA)
        .withItems({ sku: 'CAN001', unitPriceInCents: 4990, quantity: 2 })
        .build(),
    );

    const output = await new GetOrderUseCase(orders).execute({
      orderId: ORDER_ID,
      customerId: ANA,
    });

    expect(output).toMatchObject({ id: ORDER_ID, totalInCents: 9980 });
  });

  it('should reject an unknown order', async () => {
    await expect(
      new GetOrderUseCase(new InMemoryOrderRepository()).execute({
        orderId: ORDER_ID,
        customerId: ANA,
      }),
    ).rejects.toThrow(expect.objectContaining({ code: 'ORDER_NOT_FOUND' }));
  });

  it('should not show the order of another customer (RN15)', async () => {
    const orders = new InMemoryOrderRepository();
    await orders.save(anOrder().withId(ORDER_ID).withCustomerId(ANA).build());

    await expect(
      new GetOrderUseCase(orders).execute({
        orderId: ORDER_ID,
        customerId: BRUNO,
      }),
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'ORDER_NOT_FOUND',
        message: `Pedido "${ORDER_ID}" não encontrado.`,
      }),
    );
  });
});
