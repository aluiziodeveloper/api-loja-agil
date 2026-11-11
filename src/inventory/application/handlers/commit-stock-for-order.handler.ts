import type { EventHandler } from '../../../shared/application/events/event-handler.js';
import type { OrderLinesMessage } from '../order-messages.js';
import type { StockItemRepository } from '../ports/stock-item.repository.js';
import { changeStockLines } from './change-stock-lines.js';

/** RN13: o pedido foi pago, as reservas viram baixa. */
export class CommitStockForOrderHandler implements EventHandler<OrderLinesMessage> {
  constructor(private readonly stockItems: StockItemRepository) {}

  async handle(event: OrderLinesMessage): Promise<void> {
    await changeStockLines(
      this.stockItems,
      event.items,
      (stockItem, quantity) => stockItem.commit(quantity),
    );
  }
}
