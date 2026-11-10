import { ValueObject } from '../../shared/domain/value-object.js';
import { StockBelowReservedError } from './stock-below-reserved.error.js';
import { StockQuantity } from './stock-quantity.value-object.js';

type StockLevelProps = {
  onHand: StockQuantity;
  reserved: StockQuantity;
};

export type StockLevelChange = {
  onHandChange: number;
  reservedChange: number;
};

/** Físico e reservado de um item; disponível = físico − reservado (RN07). */
export class StockLevel extends ValueObject<StockLevelProps> {
  static of(onHand: StockQuantity, reserved: StockQuantity): StockLevel {
    if (onHand.isLessThan(reserved)) {
      throw new StockBelowReservedError(onHand.toNumber(), reserved.toNumber());
    }
    return new StockLevel({ onHand, reserved });
  }

  static empty(): StockLevel {
    return StockLevel.of(StockQuantity.zero(), StockQuantity.zero());
  }

  receive(quantity: StockQuantity): StockLevel {
    return StockLevel.of(this.props.onHand.add(quantity), this.props.reserved);
  }

  countedAs(counted: StockQuantity): StockLevel {
    return StockLevel.of(counted, this.props.reserved);
  }

  available(): StockQuantity {
    return this.props.onHand.subtract(this.props.reserved);
  }

  changeTo(next: StockLevel): StockLevelChange {
    const current = this.toPrimitives();
    const after = next.toPrimitives();
    return {
      onHandChange: after.onHand - current.onHand,
      reservedChange: after.reserved - current.reserved,
    };
  }

  toPrimitives(): { onHand: number; reserved: number } {
    return {
      onHand: this.props.onHand.toNumber(),
      reserved: this.props.reserved.toNumber(),
    };
  }
}
