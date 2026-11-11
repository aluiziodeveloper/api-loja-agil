import type { Prisma } from '../../../generated/prisma/client.js';
import { SearchResult } from '../../../shared/application/search/search-result.js';
import type { Sku } from '../../../shared/domain/sku.value-object.js';
import type { UniqueId } from '../../../shared/domain/unique-id.value-object.js';
import type { PrismaDatabase } from '../../../shared/infrastructure/database/prisma-database.js';
import type { ProductRepository } from '../../application/ports/product.repository.js';
import type {
  ProductSearchCriteria,
  ProductSearchParams,
  ProductSortField,
} from '../../application/product-search.js';
import { Product, type ProductSnapshot } from '../../domain/product.entity.js';

/** O campo de ordenação da aplicação e a coluna que o atende. */
const SORT_COLUMNS: Record<ProductSortField, keyof ProductSnapshot> = {
  name: 'name',
  price: 'priceInCents',
  sku: 'sku',
};

function toProduct(row: ProductSnapshot | null): Product | null {
  return row ? Product.restore(row) : null;
}

/** "Contém", sem diferenciar maiúsculas, no nome ou no SKU. */
function whereFor({
  params,
  activeOnly,
}: ProductSearchCriteria): Prisma.ProductWhereInput {
  const filter = params.filter();
  const contains = { contains: filter ?? '', mode: 'insensitive' } as const;
  return {
    ...(activeOnly ? { active: true } : {}),
    ...(filter ? { OR: [{ name: contains }, { sku: contains }] } : {}),
  };
}

/** A página pedida, ordenada pelo campo pedido e desempatada pelo id (D17). */
function pageOf(params: ProductSearchParams) {
  return {
    orderBy: [
      { [SORT_COLUMNS[params.sort()]]: params.sortDirection() },
      { id: 'asc' as const },
    ],
    skip: params.offset(),
    take: params.perPage(),
  };
}

export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly database: PrismaDatabase) {}

  async save(product: Product): Promise<void> {
    const { id, ...data } = product.toSnapshot();
    await this.database.client().product.upsert({
      where: { id },
      create: { id, ...data },
      update: data,
    });
  }

  async findById(id: UniqueId): Promise<Product | null> {
    const row = await this.database
      .client()
      .product.findUnique({ where: { id: id.toString() } });
    return toProduct(row);
  }

  async findBySku(sku: Sku): Promise<Product | null> {
    const row = await this.database
      .client()
      .product.findUnique({ where: { sku: sku.toString() } });
    return toProduct(row);
  }

  async search(
    criteria: ProductSearchCriteria,
  ): Promise<SearchResult<Product>> {
    const where = whereFor(criteria);
    const client = this.database.client();
    const [rows, total] = await Promise.all([
      client.product.findMany({ where, ...pageOf(criteria.params) }),
      client.product.count({ where }),
    ]);
    return SearchResult.create({
      items: rows.map((row) => Product.restore(row)),
      total,
      params: criteria.params,
    });
  }
}
