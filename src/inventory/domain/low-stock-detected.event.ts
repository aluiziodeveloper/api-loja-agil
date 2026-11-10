import { DomainEvent } from '../../shared/domain/domain-event.js';
import type { StockItemSnapshot } from './stock-item.snapshot.js';

/** O disponível de um item caiu abaixo do estoque mínimo (RN08). */
export class LowStockDetected extends DomainEvent {
  readonly eventName = 'LowStockDetected';
  readonly sku: string;
  readonly available: number;
  readonly minimumLevel: number;

  constructor(stock: StockItemSnapshot) {
    super(stock.id);
    this.sku = stock.sku;
    this.available = stock.onHand - stock.reserved;
    this.minimumLevel = stock.minimumLevel;
  }
}
