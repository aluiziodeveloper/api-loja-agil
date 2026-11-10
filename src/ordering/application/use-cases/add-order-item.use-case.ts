import type { UseCase } from '../../../shared/application/use-case.js';
import { Sku } from '../../../shared/domain/sku.value-object.js';
import { OrderItem } from '../../domain/order-item.value-object.js';
import { Quantity } from '../../domain/quantity.value-object.js';
import { ProductUnavailableError } from '../errors/product-unavailable.error.js';
import { changeOrder } from '../change-order.js';
import type { OrderOutput } from '../order-output.js';
import type { OrderRepository } from '../ports/order.repository.js';
import type { ProductCatalog } from '../ports/product-catalog.js';

export type AddOrderItemInput = {
  orderId: string;
  sku: string;
  quantity: number;
};

export class AddOrderItemUseCase implements UseCase<
  AddOrderItemInput,
  OrderOutput
> {
  constructor(
    private readonly orders: OrderRepository,
    private readonly catalog: ProductCatalog,
  ) {}

  async execute(input: AddOrderItemInput): Promise<OrderOutput> {
    const sku = Sku.create(input.sku);
    const quantity = Quantity.of(input.quantity);
    const product = await this.catalog.findBySku(sku);
    if (!product?.active) {
      throw new ProductUnavailableError(sku.toString());
    }
    const item = OrderItem.create({ sku, unitPrice: product.price, quantity });
    return changeOrder(this.orders, input.orderId, (order) =>
      order.addItem(item),
    );
  }
}
