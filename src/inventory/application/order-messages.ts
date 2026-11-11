import type { DomainEvent } from '../../shared/domain/domain-event.js';

/** Uma linha do pedido como o Estoque a lê: SKU e quantidade. */
export type OrderLine = {
  sku: string;
  quantity: number;
};

/**
 * Os eventos de Pedidos vistos pelo Estoque, só com os campos que ele usa. O
 * Estoque não importa código de Pedidos (ADR 0002): o contrato é o nome do
 * evento e estes campos, conferido pelo teste do fluxo completo.
 */
export type OrderLinesMessage = DomainEvent & {
  items: OrderLine[];
};

export type OrderCancelledMessage = OrderLinesMessage & {
  previousStatus: string;
};
