import type { EventHandler } from '../../../shared/application/events/event-handler.js';
import { Sku } from '../../../shared/domain/sku.value-object.js';
import { StockItem } from '../../domain/stock-item.entity.js';
import { StockQuantity } from '../../domain/stock-quantity.value-object.js';
import {
  StockShortageError,
  type StockShortage,
} from '../errors/stock-shortage.error.js';
import type { OrderLine, OrderLinesMessage } from '../order-messages.js';
import type { StockItemRepository } from '../ports/stock-item.repository.js';

/** Uma linha do pedido com o item de estoque que vai atendê-la. */
type Reservation = {
  stockItem: StockItem;
  quantity: StockQuantity;
};

function shortageOf({ stockItem, quantity }: Reservation): StockShortage[] {
  const available = stockItem.available();
  if (!available.isLessThan(quantity)) {
    return [];
  }
  return [
    {
      sku: stockItem.toSnapshot().sku,
      requested: quantity.toNumber(),
      available: available.toNumber(),
    },
  ];
}

/** RN12: ao confirmar o pedido, reserva todos os itens ou nenhum. */
export class ReserveStockForOrderHandler implements EventHandler<OrderLinesMessage> {
  constructor(private readonly stockItems: StockItemRepository) {}

  async handle(event: OrderLinesMessage): Promise<void> {
    const reservations = await Promise.all(
      event.items.map((line) => this.reservationFor(line)),
    );
    const shortages = reservations.flatMap(shortageOf);
    if (shortages.length > 0) {
      throw new StockShortageError(shortages);
    }
    for (const { stockItem, quantity } of reservations) {
      stockItem.reserve(quantity);
      await this.stockItems.save(stockItem);
    }
  }

  /** SKU sem estoque registrado conta como um item com zero unidades. */
  private async reservationFor(line: OrderLine): Promise<Reservation> {
    const sku = Sku.create(line.sku);
    const stockItem =
      (await this.stockItems.findBySku(sku)) ??
      StockItem.create(sku, StockQuantity.zero());
    return { stockItem, quantity: StockQuantity.of(line.quantity) };
  }
}
