import type { ProductRepository } from '../catalog/application/ports/product.repository.js';
import type {
  CatalogProduct,
  ProductCatalog,
} from '../ordering/application/ports/product-catalog.js';
import { Money } from '../shared/domain/money.value-object.js';
import type { Sku } from '../shared/domain/sku.value-object.js';

/**
 * O lado de lá da camada anticorrupção: lê o `Product` do Catálogo e entrega
 * ao Pedido só o que ele pediu na porta, na linguagem dele.
 */
export class ProductCatalogAdapter implements ProductCatalog {
  constructor(private readonly products: ProductRepository) {}

  async findBySku(sku: Sku): Promise<CatalogProduct | null> {
    const product = await this.products.findBySku(sku);
    if (!product) {
      return null;
    }
    const { priceInCents, active } = product.toSnapshot();
    return { sku, price: Money.fromCents(priceInCents), active };
  }
}
