import type { ProductOutput } from '../../application/product-output.js';
import { presentProduct } from './product.presenter.js';

describe('presentProduct', () => {
  const output: ProductOutput = {
    id: '0b6f1c1e-3c55-4a4f-9a8e-2d8f6f7b9c10',
    sku: 'CAN001',
    name: 'Caneca Ágil',
    priceInCents: 4590,
    active: true,
  };

  it('should answer with the fields of the API contract', () => {
    expect(presentProduct(output)).toEqual(output);
  });

  it('should leave out any field the contract does not have', () => {
    expect(
      presentProduct({ ...output, costInCents: 1200 } as ProductOutput),
    ).not.toHaveProperty('costInCents');
  });
});
