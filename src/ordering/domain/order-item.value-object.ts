import { Money } from '../../shared/domain/money.value-object.js';
import { Sku } from '../../shared/domain/sku.value-object.js';
import { ValueObject } from '../../shared/domain/value-object.js';
import { Quantity } from './quantity.value-object.js';

type OrderItemProps = {
  sku: Sku;
  unitPrice: Money;
  quantity: Quantity;
};

export type OrderItemSnapshot = {
  sku: string;
  unitPriceInCents: number;
  quantity: number;
};

/** Item de pedido com o preço congelado no momento da inclusão (RN10). */
export class OrderItem extends ValueObject<OrderItemProps> {
  static create(props: OrderItemProps): OrderItem {
    return new OrderItem(props);
  }

  static restore(snapshot: OrderItemSnapshot): OrderItem {
    return new OrderItem({
      sku: Sku.create(snapshot.sku),
      unitPrice: Money.fromCents(snapshot.unitPriceInCents),
      quantity: Quantity.of(snapshot.quantity),
    });
  }

  sku(): Sku {
    return this.props.sku;
  }

  subtotal(): Money {
    return this.props.unitPrice.multiply(this.props.quantity.toNumber());
  }

  isFor(sku: Sku): boolean {
    return this.props.sku.equals(sku);
  }

  /** Mais unidades do mesmo SKU: soma a quantidade e mantém o preço já congelado. */
  merge(other: OrderItem): OrderItem {
    return new OrderItem({
      ...this.props,
      quantity: this.props.quantity.add(other.props.quantity),
    });
  }

  toSnapshot(): OrderItemSnapshot {
    return {
      sku: this.props.sku.toString(),
      unitPriceInCents: this.props.unitPrice.toCents(),
      quantity: this.props.quantity.toNumber(),
    };
  }
}
