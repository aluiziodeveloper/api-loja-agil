/** Estado de um item de estoque em primitivos: o contrato com a borda. */
export type StockItemSnapshot = {
  id: string;
  sku: string;
  onHand: number;
  reserved: number;
  minimumLevel: number;
};
