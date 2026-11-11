import { CommitStockForOrderHandler } from '../inventory/application/handlers/commit-stock-for-order.handler.js';
import { ReserveStockForOrderHandler } from '../inventory/application/handlers/reserve-stock-for-order.handler.js';
import { ReturnStockForCancelledOrderHandler } from '../inventory/application/handlers/return-stock-for-cancelled-order.handler.js';
import type { StockItemRepository } from '../inventory/application/ports/stock-item.repository.js';
import type { EventDispatcher } from '../shared/application/events/event-dispatcher.js';

/** Os eventos de Pedidos que o Estoque ouve, e quem atende cada um (RN12 e RN13). */
export function connectInventoryToOrders(
  dispatcher: EventDispatcher,
  stockItems: StockItemRepository,
): void {
  dispatcher.subscribe(
    'OrderPlaced',
    new ReserveStockForOrderHandler(stockItems),
  );
  dispatcher.subscribe('OrderPaid', new CommitStockForOrderHandler(stockItems));
  dispatcher.subscribe(
    'OrderCancelled',
    new ReturnStockForCancelledOrderHandler(stockItems),
  );
}
