import { type ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { currentCustomerOf } from './current-customer.decorator.js';

function requestWith(headers: object): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ headers }) }),
  } as unknown as ExecutionContext;
}

describe('currentCustomerOf', () => {
  it('should read the customer from the x-customer-id header', () => {
    const customerId = currentCustomerOf(
      undefined,
      requestWith({ 'x-customer-id': '0b6f1c1e-3c55-4a4f-9a8e-2d8f6f7b9c10' }),
    );

    expect(customerId).toBe('0b6f1c1e-3c55-4a4f-9a8e-2d8f6f7b9c10');
  });

  it.each([
    ['is missing', {}],
    ['is empty', { 'x-customer-id': '' }],
    ['is repeated', { 'x-customer-id': ['a', 'b'] }],
  ])('should answer 401 when the header %s', (_, headers) => {
    expect(() => currentCustomerOf(undefined, requestWith(headers))).toThrow(
      UnauthorizedException,
    );
  });
});
