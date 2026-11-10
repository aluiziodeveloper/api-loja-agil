import { EmptyOrderError } from './empty-order.error.js';
import { Money } from './money.js';
import type { OrderLine } from './order-line.js';

export class OrderLines {
  private constructor(private readonly lines: readonly OrderLine[]) {}

  static of(lines: OrderLine[]): OrderLines {
    if (lines.length === 0) {
      throw new EmptyOrderError();
    }
    return new OrderLines([...lines]);
  }

  subtotal(): Money {
    return this.lines.reduce(
      (sum, line) => sum.add(line.total()),
      Money.zero(),
    );
  }
}
