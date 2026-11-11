import { z } from 'zod';
import type { ProductOutput } from '../../application/product-output.js';

/** O contrato da API para um produto. Preço em centavos, como no domínio. */
export const productResponse = z.object({
  id: z.uuid(),
  sku: z.string(),
  name: z.string(),
  priceInCents: z.number().int(),
  active: z.boolean(),
});

export type ProductResponse = z.infer<typeof productResponse>;

export function presentProduct(product: ProductOutput): ProductResponse {
  return productResponse.parse(product);
}
