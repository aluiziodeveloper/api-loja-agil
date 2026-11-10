import { UniqueId } from '../../../shared/domain/unique-id.value-object.js';
import { aProduct } from '../../domain/__tests__/product.builder.js';
import type { ProductSnapshot } from '../../domain/product.entity.js';
import { InMemoryProductRepository } from '../__tests__/in-memory-product.repository.js';
import { ProductNotFoundError } from '../errors/product-not-found.error.js';
import { UpdateProductUseCase } from './update-product.use-case.js';

describe('UpdateProductUseCase', () => {
  let products: InMemoryProductRepository;
  let updateProduct: UpdateProductUseCase;
  let mugId: string;

  beforeEach(async () => {
    products = new InMemoryProductRepository();
    updateProduct = new UpdateProductUseCase(products);
    const mug = aProduct()
      .withSku('CAN001')
      .withName('Caneca')
      .withPriceInCents(3500)
      .build();
    await products.save(mug);
    mugId = mug.id.toString();
  });

  async function storedMug(): Promise<ProductSnapshot | undefined> {
    const mug = await products.findById(UniqueId.from(mugId));
    return mug?.toSnapshot();
  }

  it('should change only the name when only the name is sent', async () => {
    const output = await updateProduct.execute({
      productId: mugId,
      name: 'Caneca Ágil',
    });

    expect(output).toMatchObject({ name: 'Caneca Ágil', priceInCents: 3500 });
    expect(await storedMug()).toMatchObject({
      name: 'Caneca Ágil',
      priceInCents: 3500,
    });
  });

  it('should change only the price when only the price is sent', async () => {
    await updateProduct.execute({ productId: mugId, priceInCents: 2990 });

    expect(await storedMug()).toMatchObject({
      name: 'Caneca',
      priceInCents: 2990,
    });
  });

  it('should accept a price of zero', async () => {
    await updateProduct.execute({ productId: mugId, priceInCents: 0 });

    expect((await storedMug())?.priceInCents).toBe(0);
  });

  it('should store nothing when one of the values is invalid', async () => {
    const result = updateProduct.execute({
      productId: mugId,
      name: 'Caneca Ágil',
      priceInCents: -1,
    });

    await expect(result).rejects.toThrow(
      expect.objectContaining({ code: 'INVALID_MONEY' }),
    );
    expect((await storedMug())?.name).toBe('Caneca');
  });

  it('should reject an unknown product', async () => {
    await expect(
      updateProduct.execute({
        productId: UniqueId.create().toString(),
        name: 'Caneca',
      }),
    ).rejects.toThrow(ProductNotFoundError);
  });
});
