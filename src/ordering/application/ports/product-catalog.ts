import type { Money } from '../../../shared/domain/money.value-object.js';
import type { Sku } from '../../../shared/domain/sku.value-object.js';

/** O produto como o Pedido precisa vê-lo: só o que importa para vender. */
export type CatalogProduct = {
  sku: Sku;
  price: Money;
  active: boolean;
};

/**
 * Porta para outro bounded context. O Pedido diz o que precisa, na sua
 * linguagem; o adaptador que conversa com o Catálogo vem no módulo 09.
 */
export interface ProductCatalog {
  findBySku(sku: Sku): Promise<CatalogProduct | null>;
}
