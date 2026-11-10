import { AggregateRoot } from '../../shared/domain/aggregate-root.js';
import { Sku } from '../../shared/domain/sku.value-object.js';
import { UniqueId } from '../../shared/domain/unique-id.value-object.js';
import type { AdjustmentReason } from './adjustment-reason.value-object.js';
import { LowStockDetected } from './low-stock-detected.event.js';
import type { StockItemSnapshot } from './stock-item.snapshot.js';
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

  static create(sku: Sku, minimumLevel: StockQuantity): StockItem {
    return new StockItem(UniqueId.create(), {
      sku,
      minimumLevel,
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

  changeMinimumLevel(minimumLevel: StockQuantity): void {
    this.props = { ...this.props, minimumLevel };
  }

  available(): StockQuantity {
    return this.props.level.available();
  }

  isBelowMinimum(): boolean {
    return this.props.level.isBelow(this.props.minimumLevel);
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

  /** Entrada, reserva, liberação e baixa: cada uma gera um movimento. */
  private move(
    type: StockMovementType,
    quantity: StockQuantity,
    operation: LevelOperation,
  ): void {
    this.changeLevel(type, this.props.level[operation](quantity));
  }

  private changeLevel(
    type: StockMovementType,
    next: StockLevel,
    reason?: string,
  ): void {
    const previous = this.props.level;
    this.props = { ...this.props, level: next };
    this.movements.push(stockMovement(type, previous.changeTo(next), reason));
    if (next.fellBelow(this.props.minimumLevel, previous)) {
      this.record(new LowStockDetected(this.toSnapshot()));
    }
  }
}
