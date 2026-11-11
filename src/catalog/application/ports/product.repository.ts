import type { SearchResult } from '../../../shared/application/search/search-result.js';
import type { UniqueId } from '../../../shared/domain/unique-id.value-object.js';
import type { Product } from '../../domain/product.entity.js';
import type { Sku } from '../../../shared/domain/sku.value-object.js';
import type { ProductSearchCriteria } from '../product-search.js';

/** Classe abstrata para servir de token de injeção (aula 11-03). */
export abstract class ProductRepository {
  abstract save(product: Product): Promise<void>;
  abstract findById(id: UniqueId): Promise<Product | null>;
  abstract findBySku(sku: Sku): Promise<Product | null>;
  abstract search(
    criteria: ProductSearchCriteria,
  ): Promise<SearchResult<Product>>;
}
