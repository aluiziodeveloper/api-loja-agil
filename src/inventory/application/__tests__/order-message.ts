import type { OrderLine, OrderLinesMessage } from '../order-messages.js';

export const ORDER_ID = '01890a5d-ac96-774b-bcce-b302099a8058';

/** Um evento de Pedidos montado à mão, como chega ao Estoque. */
export function orderMessage(
  eventName: string,
  items: OrderLine[],
): OrderLinesMessage {
  return { eventName, aggregateId: ORDER_ID, occurredAt: new Date(), items };
}
