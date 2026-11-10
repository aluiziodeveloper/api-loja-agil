import { Money } from '../../../shared/domain/money.value-object.js';
import { Sku } from '../../../shared/domain/sku.value-object.js';
import type {
  CatalogProduct,
  ProductCatalog,
} from '../ports/product-catalog.js';

type CatalogEntry = {
  sku: string;
  priceInCents: number;
  active?: boolean;
};

/** Um catálogo de mentira: o teste diz quais produtos existem. */
export class InMemoryProductCatalog implements ProductCatalog {
  private readonly products = new Map<string, CatalogProduct>();

  register({ sku, priceInCents, active = true }: CatalogEntry): void {
    const product = {
      sku: Sku.create(sku),
      price: Money.fromCents(priceInCents),
      active,
    };
    this.products.set(product.sku.toString(), product);
  }

  async findBySku(sku: Sku): Promise<CatalogProduct | null> {
    return this.products.get(sku.toString()) ?? null;
  }
}
