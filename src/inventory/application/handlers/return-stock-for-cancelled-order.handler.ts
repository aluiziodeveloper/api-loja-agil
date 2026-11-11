import type { EventHandler } from '../../../shared/application/events/event-handler.js';
import type { OrderCancelledMessage } from '../order-messages.js';
import type { StockItemRepository } from '../ports/stock-item.repository.js';
import { changeStockLines, type StockChange } from './change-stock-lines.js';

/**
 * O que desfazer, conforme o estado do pedido antes de cancelar (RN13). Um
 * rascunho nunca reservou nada; um pedido pago já deu baixa, e as unidades,
 * que não saíram do depósito, voltam como entrada.
 */
const UNDO_BY_PREVIOUS_STATUS: Partial<Record<string, StockChange>> = {
  PLACED: (stockItem, quantity) => stockItem.release(quantity),
  PAID: (stockItem, quantity) => stockItem.receive(quantity),
};

export class ReturnStockForCancelledOrderHandler implements EventHandler<OrderCancelledMessage> {
  constructor(private readonly stockItems: StockItemRepository) {}

  async handle(event: OrderCancelledMessage): Promise<void> {
    const undo = UNDO_BY_PREVIOUS_STATUS[event.previousStatus];
    if (undo) {
      await changeStockLines(this.stockItems, event.items, undo);
    }
  }
}
