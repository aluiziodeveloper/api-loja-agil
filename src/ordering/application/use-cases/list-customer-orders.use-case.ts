import type { SearchParamsInput } from '../../../shared/application/search/search-params.js';
import type { SearchOutput } from '../../../shared/application/search/search-result.js';
import type { UseCase } from '../../../shared/application/use-case.js';
import { UniqueId } from '../../../shared/domain/unique-id.value-object.js';
import { toOrderOutput, type OrderOutput } from '../order-output.js';
import { orderSearchParams } from '../order-search.js';
import type { OrderRepository } from '../ports/order.repository.js';

export type ListCustomerOrdersInput = Pick<
  SearchParamsInput,
  'page' | 'perPage' | 'sortDirection'
> & {
  customerId: string;
};

export class ListCustomerOrdersUseCase implements UseCase<
  ListCustomerOrdersInput,
  SearchOutput<OrderOutput>
> {
  constructor(private readonly orders: OrderRepository) {}

  async execute({
    customerId,
    ...input
  }: ListCustomerOrdersInput): Promise<SearchOutput<OrderOutput>> {
    const params = orderSearchParams(input);
    const result = await this.orders.listByCustomer(
      UniqueId.from(customerId),
      params,
    );
    return result.map(toOrderOutput).toOutput();
  }
}
