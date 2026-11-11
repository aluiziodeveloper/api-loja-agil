import { DomainError } from '../../../shared/domain/domain-error.js';

export type StockShortage = {
  sku: string;
  requested: number;
  available: number;
};

function describe({ sku, requested, available }: StockShortage): string {
  return `${sku} (solicitado ${requested}, disponível ${available})`;
}

/** Um pedido pediu mais do que há: lista todas as faltas de uma vez. */
export class StockShortageError extends DomainError {
  readonly code = 'STOCK_SHORTAGE';

  constructor(readonly shortages: StockShortage[]) {
    super(`Estoque insuficiente: ${shortages.map(describe).join('; ')}.`);
  }
}
