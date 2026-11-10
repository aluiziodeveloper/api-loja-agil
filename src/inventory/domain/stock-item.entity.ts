import { AggregateRoot } from '../../shared/domain/aggregate-root.js';
import { Sku } from '../../shared/domain/sku.value-object.js';
import { UniqueId } from '../../shared/domain/unique-id.value-object.js';
import type { AdjustmentReason } from './adjustment-reason.value-object.js';
import { EmptyStockMovementError } from './empty-stock-movement.error.js';
import { StockLevel } from './stock-level.value-object.js';
import {
  stockMovement,
  StockMovementType,
  type StockMovement,
} from './stock-movement.js';
import { StockQuantity } from './stock-quantity.value-object.js';

type StockItemProps = {
  sku: Sku;
  level: StockLevel;
  minimumLevel: StockQuantity;
};

export type CreateStockItemProps = Pick<StockItemProps, 'sku' | 'minimumLevel'>;

export type StockItemSnapshot = {
  id: string;
  sku: string;
  onHand: number;
  reserved: number;
  minimumLevel: number;
};

/** Operações do nível que movimentam uma quantidade positiva. */
type LevelOperation = 'receive' | 'reserve' | 'release' | 'commit';

export class StockItem extends AggregateRoot {
  private readonly movements: StockMovement[] = [];

  private constructor(
    id: UniqueId,
    private props: StockItemProps,
  ) {
    super(id);
  }

  static create(props: CreateStockItemProps): StockItem {
    return new StockItem(UniqueId.create(), {
      ...props,
      level: StockLevel.empty(),
    });
  }

  static restore(snapshot: StockItemSnapshot): StockItem {
    return new StockItem(UniqueId.from(snapshot.id), {
      sku: Sku.create(snapshot.sku),
      level: StockLevel.fromPrimitives(snapshot.onHand, snapshot.reserved),
      minimumLevel: StockQuantity.of(snapshot.minimumLevel),
    });
  }

  receive(quantity: StockQuantity): void {
    this.move(StockMovementType.RECEIPT, quantity, 'receive');
  }

  reserve(quantity: StockQuantity): void {
    this.move(StockMovementType.RESERVATION, quantity, 'reserve');
  }

  release(quantity: StockQuantity): void {
    this.move(StockMovementType.RELEASE, quantity, 'release');
  }

  commit(quantity: StockQuantity): void {
    this.move(StockMovementType.COMMIT, quantity, 'commit');
  }

  adjust(counted: StockQuantity, reason: AdjustmentReason): void {
    const next = this.props.level.countedAs(counted);
    if (!next.equals(this.props.level)) {
      this.changeLevel(StockMovementType.ADJUSTMENT, next, reason.toString());
    }
  }

  available(): StockQuantity {
    return this.props.level.available();
  }

  pullMovements(): StockMovement[] {
    return this.movements.splice(0);
  }

  toSnapshot(): StockItemSnapshot {
    return {
      id: this.id.toString(),
      sku: this.props.sku.toString(),
      ...this.props.level.toPrimitives(),
      minimumLevel: this.props.minimumLevel.toNumber(),
    };
  }

  /** Entrada, reserva, liberação e baixa: quantidade positiva e um movimento. */
  private move(
    type: StockMovementType,
    quantity: StockQuantity,
    operation: LevelOperation,
  ): void {
    if (quantity.isZero()) {
      throw new EmptyStockMovementError();
    }
    this.changeLevel(type, this.props.level[operation](quantity));
  }

  private changeLevel(
    type: StockMovementType,
    next: StockLevel,
    reason?: string,
  ): void {
    const change = this.props.level.changeTo(next);
    this.props = { ...this.props, level: next };
    this.movements.push(stockMovement(type, change, reason));
  }
}
