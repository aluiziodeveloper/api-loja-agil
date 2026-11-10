import { faker } from '@faker-js/faker';

import { UniqueId } from '../../../shared/domain/unique-id.value-object.js';
import { Product, type ProductSnapshot } from '../product.entity.js';

export class ProductBuilder {
  private snapshot: ProductSnapshot = {
    id: UniqueId.create().toString(),
    sku: faker.string.alphanumeric({ length: 8, casing: 'upper' }),
    name: faker.commerce.productName(),
    priceInCents: faker.number.int({ min: 100, max: 100_000 }),
    active: true,
  };

  withSku(sku: string): this {
    return this.with({ sku });
  }

  withName(name: string): this {
    return this.with({ name });
  }

  withPriceInCents(priceInCents: number): this {
    return this.with({ priceInCents });
  }

  inactive(): this {
    return this.with({ active: false });
  }

  build(): Product {
    return Product.restore(this.snapshot);
  }

  private with(changes: Partial<ProductSnapshot>): this {
    this.snapshot = { ...this.snapshot, ...changes };
    return this;
  }
}

export function aProduct(): ProductBuilder {
  return new ProductBuilder();
}
