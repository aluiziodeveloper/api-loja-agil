import type { Product } from '../domain/product.entity.js';

export type ProductOutput = {
  id: string;
  sku: string;
  name: string;
  priceInCents: number;
  active: boolean;
};

export function toProductOutput(product: Product): ProductOutput {
  const { id, sku, name, priceInCents, active } = product.toSnapshot();
  return { id, sku, name, priceInCents, active };
}
