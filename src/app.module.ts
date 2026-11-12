import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  APP_FILTER,
  APP_GUARD,
  APP_INTERCEPTOR,
  Reflector,
} from '@nestjs/core';
import { appErrorStatus } from './app-error-status.js';
import { CatalogModule } from './catalog/catalog.module.js';
import { validateEnv } from './config/env.schema.js';
import { HealthModule } from './health/health.module.js';
import { IdentityModule } from './identity/identity.module.js';
import { IntegrationModule } from './integration/integration.module.js';
import { InventoryModule } from './inventory/inventory.module.js';
import { OrderingModule } from './ordering/ordering.module.js';
import { AccessTokens } from './shared/infrastructure/auth/access-tokens.js';
import { AuthGuard } from './shared/infrastructure/auth/auth.guard.js';
import { AuthModule } from './shared/infrastructure/auth/auth.module.js';
import { RolesGuard } from './shared/infrastructure/auth/roles.guard.js';
import { DatabaseModule } from './shared/infrastructure/database/database.module.js';
import { LoggingModule } from './shared/infrastructure/logging/logging.module.js';
import { EnvelopeInterceptor } from './shared/infrastructure/http/envelope.interceptor.js';
import { ErrorResponseFilter } from './shared/infrastructure/http/error-response.filter.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
    }),
    LoggingModule,
    DatabaseModule,
    AuthModule,
    HealthModule,
    IdentityModule,
    CatalogModule,
    InventoryModule,
    OrderingModule,
    IntegrationModule,
  ],
  providers: [
    // Registrados aqui, e não no main.ts, valem também para a aplicação dos testes.
    {
      provide: APP_FILTER,
      useFactory: () => new ErrorResponseFilter(appErrorStatus),
    },
    { provide: APP_INTERCEPTOR, useClass: EnvelopeInterceptor },
    {
      provide: APP_GUARD,
      useFactory: (reflector: Reflector, accessTokens: AccessTokens) =>
        new AuthGuard(reflector, accessTokens),
      inject: [Reflector, AccessTokens],
    },
    // Na ordem de registro: primeiro quem é (401), depois o que pode (403).
    {
      provide: APP_GUARD,
      useFactory: (reflector: Reflector) => new RolesGuard(reflector),
      inject: [Reflector],
    },
  ],
})
export class AppModule {}
