import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { appErrorStatus } from './app-error-status.js';
import { validateEnv } from './config/env.schema.js';
import { HealthModule } from './health/health.module.js';
import { IdentityModule } from './identity/identity.module.js';
import { DatabaseModule } from './shared/infrastructure/database/database.module.js';
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
  ],
  providers: [
    // Registrado aqui, e não no main.ts, vale também para a aplicação dos testes.
    {
      provide: APP_FILTER,
      useFactory: () => new ErrorResponseFilter(appErrorStatus),
    },
  ],
})
export class AppModule {}
