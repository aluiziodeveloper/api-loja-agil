import type { SearchResult } from '../../../shared/application/search/search-result.js';
import type { UniqueId } from '../../../shared/domain/unique-id.value-object.js';
import type { Product } from '../../domain/product.entity.js';
import type { Sku } from '../../../shared/domain/sku.value-object.js';
import type { ProductSearchCriteria } from '../product-search.js';

export interface ProductRepository {
  save(product: Product): Promise<void>;
  findById(id: UniqueId): Promise<Product | null>;
  findBySku(sku: Sku): Promise<Product | null>;
  search(criteria: ProductSearchCriteria): Promise<SearchResult<Product>>;
}
