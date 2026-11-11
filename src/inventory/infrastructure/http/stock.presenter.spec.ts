import { presentMovement, presentStock } from './stock.presenter.js';

describe('stock presenters', () => {
  it('should present a stock level with the fields of the API contract', () => {
    const stock = {
      sku: 'CAN001',
      onHand: 10,
      reserved: 3,
      available: 7,
      minimumLevel: 5,
      belowMinimum: false,
    };

    expect(presentStock({ ...stock, version: 4 } as typeof stock)).toEqual(
      stock,
    );
  });

  it('should present a movement with the date in ISO 8601', () => {
    const movement = {
      type: 'ADJUSTMENT' as const,
      onHandChange: -2,
      reservedChange: 0,
      reason: 'Avaria',
      occurredAt: '2026-11-11T13:00:00.000Z',
    };

    expect(presentMovement(movement)).toEqual(movement);
  });
});
