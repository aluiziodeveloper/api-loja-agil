import type { UniqueId } from '../../../shared/domain/unique-id.value-object.js';
import type { Product } from '../../domain/product.entity.js';
import type { Sku } from '../../domain/sku.value-object.js';

export interface ProductRepository {
  save(product: Product): Promise<void>;
  findById(id: UniqueId): Promise<Product | null>;
  findBySku(sku: Sku): Promise<Product | null>;
}
