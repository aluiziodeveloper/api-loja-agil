import { ValueObject } from '../../shared/domain/value-object.js';
import { InsufficientStockError } from './insufficient-stock.error.js';
import { ReservedStockExceededError } from './reserved-stock-exceeded.error.js';
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

  static fromPrimitives(onHand: number, reserved: number): StockLevel {
    return StockLevel.of(StockQuantity.of(onHand), StockQuantity.of(reserved));
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

  reserve(quantity: StockQuantity): StockLevel {
    const available = this.available();
    if (available.isLessThan(quantity)) {
      throw new InsufficientStockError(
        quantity.toNumber(),
        available.toNumber(),
      );
    }
    return StockLevel.of(this.props.onHand, this.props.reserved.add(quantity));
  }

  release(quantity: StockQuantity): StockLevel {
    return StockLevel.of(this.props.onHand, this.takeReserved(quantity));
  }

  commit(quantity: StockQuantity): StockLevel {
    const reserved = this.takeReserved(quantity);
    return StockLevel.of(this.props.onHand.subtract(quantity), reserved);
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

  private takeReserved(quantity: StockQuantity): StockQuantity {
    const { reserved } = this.props;
    if (reserved.isLessThan(quantity)) {
      throw new ReservedStockExceededError(
        quantity.toNumber(),
        reserved.toNumber(),
      );
    }
    return reserved.subtract(quantity);
  }
}
