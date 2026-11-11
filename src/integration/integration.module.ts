import { Global, Inject, Module, type OnModuleInit } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module.js';
import { ProductRepository } from '../catalog/application/ports/product.repository.js';
import { InventoryModule } from '../inventory/inventory.module.js';
import { StockItemRepository } from '../inventory/application/ports/stock-item.repository.js';
import { ProductCatalog } from '../ordering/application/ports/product-catalog.js';
import { EventDispatcher } from '../shared/application/events/event-dispatcher.js';
import { EventPublisher } from '../shared/application/events/event-publisher.js';
import { connectInventoryToOrders } from './connect-inventory-to-orders.js';
import { ProductCatalogAdapter } from './product-catalog.adapter.js';

/**
 * A camada que liga os contextos, agora no Nest. O Pedido declara as portas
 * de que precisa (`ProductCatalog`, `EventPublisher`) e não importa ninguém;
 * este módulo entrega as duas. É global justamente para isso: o
 * `OrderingModule` recebe as portas sem importar a integração (ADR 0002).
 */
@Global()
@Module({
  imports: [CatalogModule, InventoryModule],
  providers: [
    { provide: EventDispatcher, useFactory: () => new EventDispatcher() },
    { provide: EventPublisher, useExisting: EventDispatcher },
    {
      provide: ProductCatalog,
      useFactory: (products: ProductRepository) =>
        new ProductCatalogAdapter(products),
      inject: [ProductRepository],
    },
  ],
  exports: [EventPublisher, ProductCatalog],
})
export class IntegrationModule implements OnModuleInit {
  constructor(
    @Inject(EventDispatcher) private readonly dispatcher: EventDispatcher,
    @Inject(StockItemRepository)
    private readonly stockItems: StockItemRepository,
  ) {}

  /** Antes da primeira requisição, o Estoque já ouve os eventos de Pedidos. */
  onModuleInit(): void {
    connectInventoryToOrders(this.dispatcher, this.stockItems);
  }
}
