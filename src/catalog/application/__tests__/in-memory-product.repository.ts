import type { UniqueId } from '../../../shared/domain/unique-id.value-object.js';
import { Product, type ProductSnapshot } from '../../domain/product.entity.js';
import type { Sku } from '../../domain/sku.value-object.js';
import type { ProductRepository } from '../ports/product.repository.js';

export class InMemoryProductRepository implements ProductRepository {
  private readonly snapshots = new Map<string, ProductSnapshot>();

  async save(product: Product): Promise<void> {
    const snapshot = product.toSnapshot();
    this.snapshots.set(snapshot.id, snapshot);
  }

  async findById(id: UniqueId): Promise<Product | null> {
    return this.restore(this.snapshots.get(id.toString()));
  }

  async findBySku(sku: Sku): Promise<Product | null> {
    const code = sku.toString();
    const all = [...this.snapshots.values()];
    return this.restore(all.find((snapshot) => snapshot.sku === code));
  }

  private restore(snapshot?: ProductSnapshot): Product | null {
    return snapshot ? Product.restore(snapshot) : null;
  }
}
