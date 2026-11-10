import { AggregateRoot } from '../../shared/domain/aggregate-root.js';
import { Money } from '../../shared/domain/money.value-object.js';
import { UniqueId } from '../../shared/domain/unique-id.value-object.js';
import { ProductName } from './product-name.value-object.js';
import { Sku } from '../../shared/domain/sku.value-object.js';

type ProductProps = {
  sku: Sku;
  name: ProductName;
  price: Money;
  active: boolean;
};

export type CreateProductProps = Omit<ProductProps, 'active'>;

export type ProductSnapshot = {
  id: string;
  sku: string;
  name: string;
  priceInCents: number;
  active: boolean;
};

export class Product extends AggregateRoot {
  private constructor(
    id: UniqueId,
    private props: ProductProps,
  ) {
    super(id);
  }

  static create(props: CreateProductProps): Product {
    return new Product(UniqueId.create(), { ...props, active: true });
  }

  static restore(snapshot: ProductSnapshot): Product {
    return new Product(UniqueId.from(snapshot.id), {
      sku: Sku.create(snapshot.sku),
      name: ProductName.create(snapshot.name),
      price: Money.fromCents(snapshot.priceInCents),
      active: snapshot.active,
    });
  }

  rename(name: ProductName): void {
    this.props = { ...this.props, name };
  }

  changePrice(price: Money): void {
    this.props = { ...this.props, price };
  }

  activate(): void {
    this.props = { ...this.props, active: true };
  }

  deactivate(): void {
    this.props = { ...this.props, active: false };
  }

  isActive(): boolean {
    return this.props.active;
  }

  toSnapshot(): ProductSnapshot {
    return {
      id: this.id.toString(),
      sku: this.props.sku.toString(),
      name: this.props.name.toString(),
      priceInCents: this.props.price.toCents(),
      active: this.props.active,
    };
  }
}
