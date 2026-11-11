import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { principalOf } from '../../../shared/infrastructure/auth/principal.js';

/**
 * O cliente é o usuário do token. No módulo 11, era o header provisório
 * `x-customer-id`: só esta função mudou, e controllers e casos de uso
 * continuam recebendo um `customerId`.
 */
export function currentCustomerOf(
  data: unknown,
  context: ExecutionContext,
): string {
  return principalOf(data, context).userId;
}

/** O id do cliente que fez a requisição. */
export const CurrentCustomer = createParamDecorator(currentCustomerOf);
