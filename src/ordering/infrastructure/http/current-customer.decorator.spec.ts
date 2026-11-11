import { type ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { currentCustomerOf } from './current-customer.decorator.js';

function requestWith(request: object): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('currentCustomerOf', () => {
  it('should take the customer from the user of the token', () => {
    const customerId = currentCustomerOf(
      undefined,
      requestWith({
        headers: {},
        principal: {
          userId: '0b6f1c1e-3c55-4a4f-9a8e-2d8f6f7b9c10',
          role: 'CUSTOMER',
        },
      }),
    );

    expect(customerId).toBe('0b6f1c1e-3c55-4a4f-9a8e-2d8f6f7b9c10');
  });

  it('should not trust the old x-customer-id header anymore', () => {
    const request = requestWith({
      headers: { 'x-customer-id': '0b6f1c1e-3c55-4a4f-9a8e-2d8f6f7b9c10' },
    });

    expect(() => currentCustomerOf(undefined, request)).toThrow(
      UnauthorizedException,
    );
  });
});
