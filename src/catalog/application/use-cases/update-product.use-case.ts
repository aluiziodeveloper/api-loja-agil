import type { UseCase } from '../../../shared/application/use-case.js';
import { Money } from '../../../shared/domain/money.value-object.js';
import { ProductName } from '../../domain/product-name.value-object.js';
import { loadProduct } from '../load-product.js';
import type { ProductRepository } from '../ports/product.repository.js';
import { toProductOutput, type ProductOutput } from '../product-output.js';

export type UpdateProductInput = {
  productId: string;
  name?: string;
  priceInCents?: number;
};

/** Converte um campo opcional: "não enviado" continua indefinido. */
function parseOptional<Raw, Parsed>(
  value: Raw | undefined,
  parse: (raw: Raw) => Parsed,
): Parsed | undefined {
  return value === undefined ? undefined : parse(value);
}

export class UpdateProductUseCase implements UseCase<
  UpdateProductInput,
  ProductOutput
> {
  constructor(private readonly products: ProductRepository) {}

  async execute(input: UpdateProductInput): Promise<ProductOutput> {
    const product = await loadProduct(this.products, input.productId);
    const name = parseOptional(input.name, (raw) => ProductName.create(raw));
    const price = parseOptional(input.priceInCents, (raw) =>
      Money.fromCents(raw),
    );

    if (name) {
      product.rename(name);
    }
    if (price) {
      product.changePrice(price);
    }
    await this.products.save(product);
    return toProductOutput(product);
  }
}
