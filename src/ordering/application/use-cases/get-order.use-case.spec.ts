import { anOrder } from '../../domain/__tests__/order.builder.js';
import { InMemoryOrderRepository } from '../__tests__/in-memory-order.repository.js';
import { GetOrderUseCase } from './get-order.use-case.js';

const ORDER_ID = '01890a5d-ac96-774b-bcce-b302099a8058';

describe('GetOrderUseCase', () => {
  it('should return an order', async () => {
    const orders = new InMemoryOrderRepository();
    await orders.save(
      anOrder()
        .withId(ORDER_ID)
        .withItems({ sku: 'CAN001', unitPriceInCents: 4990, quantity: 2 })
        .build(),
    );

    const output = await new GetOrderUseCase(orders).execute({
      orderId: ORDER_ID,
    });

    expect(output).toMatchObject({ id: ORDER_ID, totalInCents: 9980 });
  });

  it('should reject an unknown order', async () => {
    await expect(
      new GetOrderUseCase(new InMemoryOrderRepository()).execute({
        orderId: ORDER_ID,
      }),
    ).rejects.toThrow(expect.objectContaining({ code: 'ORDER_NOT_FOUND' }));
  });
});
