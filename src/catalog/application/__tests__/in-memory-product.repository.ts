import { SortDirection } from '../../../shared/application/search/search-params.js';
import { SearchResult } from '../../../shared/application/search/search-result.js';
import type { UniqueId } from '../../../shared/domain/unique-id.value-object.js';
import { Product, type ProductSnapshot } from '../../domain/product.entity.js';
import type { Sku } from '../../domain/sku.value-object.js';
import type { ProductRepository } from '../ports/product.repository.js';
import type {
  ProductSearchCriteria,
  ProductSearchParams,
  ProductSortField,
} from '../product-search.js';

type Comparator = (first: ProductSnapshot, second: ProductSnapshot) => number;

const collator = new Intl.Collator('pt-BR');

const comparators: Record<ProductSortField, Comparator> = {
  name: (first, second) => collator.compare(first.name, second.name),
  price: (first, second) => first.priceInCents - second.priceInCents,
  sku: (first, second) => collator.compare(first.sku, second.sku),
};

/** Ignora maiúsculas, como o modo "insensitive" do Prisma; acentos importam. */
function matchesFilter(
  snapshot: ProductSnapshot,
  filter: string | null,
): boolean {
  if (filter === null) {
    return true;
  }
  const term = filter.toLowerCase();
  return [snapshot.name, snapshot.sku].some((text) =>
    text.toLowerCase().includes(term),
  );
}

function matches(
  snapshot: ProductSnapshot,
  { params, activeOnly }: ProductSearchCriteria,
): boolean {
  if (activeOnly && !snapshot.active) {
    return false;
  }
  return matchesFilter(snapshot, params.filter());
}

/** Empates são desfeitos pelo id, para a paginação ser estável. */
function compareBy(params: ProductSearchParams): Comparator {
  const compare = comparators[params.sort()];
  const direction = params.sortDirection() === SortDirection.DESC ? -1 : 1;
  return (first, second) =>
    direction * compare(first, second) || (first.id < second.id ? -1 : 1);
}

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

  async search(
    criteria: ProductSearchCriteria,
  ): Promise<SearchResult<Product>> {
    const { params } = criteria;
    const matching = [...this.snapshots.values()]
      .filter((snapshot) => matches(snapshot, criteria))
      .sort(compareBy(params));
    const start = params.offset();
    const page = matching.slice(start, start + params.perPage());
    return SearchResult.create({
      items: page.map((snapshot) => Product.restore(snapshot)),
      total: matching.length,
      params,
    });
  }

  private restore(snapshot?: ProductSnapshot): Product | null {
    return snapshot ? Product.restore(snapshot) : null;
  }
}
