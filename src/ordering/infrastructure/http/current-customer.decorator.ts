import {
  createParamDecorator,
  type ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export const CUSTOMER_HEADER = 'x-customer-id';

type RequestWithHeaders = {
  headers: Record<string, string | string[] | undefined>;
};

/**
 * PROVISÓRIO até o módulo 12: o cliente se identifica por um header, sem
 * prova nenhuma. Quando o JWT chegar, só esta função muda; controllers e
 * casos de uso continuam recebendo um `customerId`.
 */
export function currentCustomerOf(
  _data: unknown,
  context: ExecutionContext,
): string {
  const { headers } = context.switchToHttp().getRequest<RequestWithHeaders>();
  const customerId = headers[CUSTOMER_HEADER];
  if (typeof customerId !== 'string' || customerId.length === 0) {
    throw new UnauthorizedException(
      `Informe o cliente no header ${CUSTOMER_HEADER}.`,
    );
  }
  return customerId;
}

/** O id do cliente que fez a requisição. */
export const CurrentCustomer = createParamDecorator(currentCustomerOf);
