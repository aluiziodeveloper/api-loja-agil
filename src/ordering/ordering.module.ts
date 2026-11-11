import { Module } from '@nestjs/common';
import { PrismaDatabase } from '../shared/infrastructure/database/prisma-database.js';
import { provideUseCase } from '../shared/infrastructure/nest/provide-use-case.js';
import { CouponRepository } from './application/ports/coupon.repository.js';
import { OrderRepository } from './application/ports/order.repository.js';
import { ProductCatalog } from './application/ports/product-catalog.js';
import { AddOrderItemUseCase } from './application/use-cases/add-order-item.use-case.js';
import { ApplyCouponUseCase } from './application/use-cases/apply-coupon.use-case.js';
import { CancelOrderUseCase } from './application/use-cases/cancel-order.use-case.js';
import { CreateCouponUseCase } from './application/use-cases/create-coupon.use-case.js';
import { CreateDraftOrderUseCase } from './application/use-cases/create-draft-order.use-case.js';
import { GetOrderUseCase } from './application/use-cases/get-order.use-case.js';
import { ListCustomerOrdersUseCase } from './application/use-cases/list-customer-orders.use-case.js';
import { PayOrderUseCase } from './application/use-cases/pay-order.use-case.js';
import { PlaceOrderUseCase } from './application/use-cases/place-order.use-case.js';
import { RemoveCouponUseCase } from './application/use-cases/remove-coupon.use-case.js';
import { RemoveOrderItemUseCase } from './application/use-cases/remove-order-item.use-case.js';
import { ShipOrderUseCase } from './application/use-cases/ship-order.use-case.js';
import { AddOrderItemController } from './infrastructure/http/add-order-item.controller.js';
import { ApplyCouponController } from './infrastructure/http/apply-coupon.controller.js';
import { CancelOrderController } from './infrastructure/http/cancel-order.controller.js';
import { CreateCouponController } from './infrastructure/http/create-coupon.controller.js';
import { CreateDraftOrderController } from './infrastructure/http/create-draft-order.controller.js';
import { GetOrderController } from './infrastructure/http/get-order.controller.js';
import { ListCustomerOrdersController } from './infrastructure/http/list-customer-orders.controller.js';
import { PayOrderController } from './infrastructure/http/pay-order.controller.js';
import { PlaceOrderController } from './infrastructure/http/place-order.controller.js';
import { RemoveCouponController } from './infrastructure/http/remove-coupon.controller.js';
import { RemoveOrderItemController } from './infrastructure/http/remove-order-item.controller.js';
import { ShipOrderController } from './infrastructure/http/ship-order.controller.js';
import { provideTransition } from './infrastructure/nest/provide-transition.js';
import { PrismaCouponRepository } from './infrastructure/persistence/prisma-coupon.repository.js';
import { PrismaOrderRepository } from './infrastructure/persistence/prisma-order.repository.js';

/** `ProductCatalog` e `EventPublisher` chegam do IntegrationModule, global. */
@Module({
  controllers: [
    CreateDraftOrderController,
    ListCustomerOrdersController,
    GetOrderController,
    AddOrderItemController,
    RemoveOrderItemController,
    ApplyCouponController,
    RemoveCouponController,
    PlaceOrderController,
    PayOrderController,
    ShipOrderController,
    CancelOrderController,
    CreateCouponController,
  ],
  providers: [
    {
      provide: OrderRepository,
      useFactory: (database: PrismaDatabase) =>
        new PrismaOrderRepository(database),
      inject: [PrismaDatabase],
    },
    {
      provide: CouponRepository,
      useFactory: (database: PrismaDatabase) =>
        new PrismaCouponRepository(database),
      inject: [PrismaDatabase],
    },
    provideUseCase(CreateDraftOrderUseCase, [OrderRepository]),
    provideUseCase(GetOrderUseCase, [OrderRepository]),
    provideUseCase(ListCustomerOrdersUseCase, [OrderRepository]),
    provideUseCase(AddOrderItemUseCase, [OrderRepository, ProductCatalog]),
    provideUseCase(RemoveOrderItemUseCase, [OrderRepository]),
    provideUseCase(ApplyCouponUseCase, [OrderRepository, CouponRepository]),
    provideUseCase(RemoveCouponUseCase, [OrderRepository]),
    provideUseCase(CreateCouponUseCase, [CouponRepository]),
    provideTransition(PlaceOrderUseCase),
    provideTransition(PayOrderUseCase),
    provideTransition(ShipOrderUseCase),
    provideTransition(CancelOrderUseCase),
  ],
})
export class OrderingModule {}
