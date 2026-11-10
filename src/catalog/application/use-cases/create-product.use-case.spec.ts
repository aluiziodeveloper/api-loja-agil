import { aProduct } from '../../domain/__tests__/product.builder.js';
import { Sku } from '../../../shared/domain/sku.value-object.js';
import { InMemoryProductRepository } from '../__tests__/in-memory-product.repository.js';
import { SkuAlreadyInUseError } from '../errors/sku-already-in-use.error.js';
import { CreateProductUseCase } from './create-product.use-case.js';

describe('CreateProductUseCase', () => {
  let products: InMemoryProductRepository;
  let createProduct: CreateProductUseCase;

  beforeEach(() => {
    products = new InMemoryProductRepository();
    createProduct = new CreateProductUseCase(products);
  });

  it('should create an active product with a normalized SKU', async () => {
    const output = await createProduct.execute({
      sku: 'cam123-azul',
      name: 'Camiseta Azul',
      priceInCents: 4990,
    });

    expect(output).toEqual({
      id: expect.any(String),
      sku: 'CAM123-AZUL',
      name: 'Camiseta Azul',
      priceInCents: 4990,
      active: true,
    });
  });

  it('should store the product', async () => {
    const output = await createProduct.execute({
      sku: 'CAN001',
      name: 'Caneca Ágil',
      priceInCents: 3500,
    });

    const stored = await products.findBySku(Sku.create('CAN001'));
    expect(stored?.toSnapshot()).toEqual(output);
  });

  it('should reject a SKU that is already in use, ignoring case', async () => {
    await products.save(aProduct().withSku('CAN001').build());

    const result = createProduct.execute({
      sku: 'can001',
      name: 'Outra Caneca',
      priceInCents: 2000,
    });

    await expect(result).rejects.toThrow(SkuAlreadyInUseError);
    await expect(result).rejects.toMatchObject({
      code: 'SKU_ALREADY_IN_USE',
      message: 'O SKU "CAN001" já está em uso.',
    });
  });

  it.each([
    ['an invalid SKU', { sku: 'A B', name: 'Caneca', priceInCents: 100 }],
    ['an invalid name', { sku: 'CAN002', name: 'C', priceInCents: 100 }],
    ['a negative price', { sku: 'CAN002', name: 'Caneca', priceInCents: -1 }],
  ])('should store nothing when given %s', async (_case, input) => {
    await expect(createProduct.execute(input)).rejects.toThrow();

    expect(await products.findBySku(Sku.create('CAN002'))).toBeNull();
  });
});
