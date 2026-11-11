import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { appErrorStatus } from './app-error-status.js';
import { CatalogModule } from './catalog/catalog.module.js';
import { validateEnv } from './config/env.schema.js';
import { HealthModule } from './health/health.module.js';
import { IdentityModule } from './identity/identity.module.js';
import { InventoryModule } from './inventory/inventory.module.js';
import { DatabaseModule } from './shared/infrastructure/database/database.module.js';
import { EnvelopeInterceptor } from './shared/infrastructure/http/envelope.interceptor.js';
import { ErrorResponseFilter } from './shared/infrastructure/http/error-response.filter.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
    }),
    DatabaseModule,
    HealthModule,
    IdentityModule,
    CatalogModule,
    InventoryModule,
  ],
  providers: [
    // Registrados aqui, e não no main.ts, valem também para a aplicação dos testes.
    {
      provide: APP_FILTER,
      useFactory: () => new ErrorResponseFilter(appErrorStatus),
    },
    { provide: APP_INTERCEPTOR, useClass: EnvelopeInterceptor },
  ],
})
export class AppModule {}
