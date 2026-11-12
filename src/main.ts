import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module.js';
import { appErrorStatus } from './app-error-status.js';
import { type Env, validateEnv } from './config/env.schema.js';
import { createFastifyAdapter } from './shared/infrastructure/http/create-fastify-adapter.js';
import { setupOpenApi } from './shared/infrastructure/openapi/open-api.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    createFastifyAdapter(validateEnv(process.env)),
    // As mensagens da inicialização esperam o logger do Nest virar o pino.
    { bufferLogs: true },
  );
  app.useLogger(app.get(Logger));
  setupOpenApi(app, appErrorStatus);
  const config = app.get<ConfigService<Env, true>>(ConfigService);

  await app.listen(config.get('PORT', { infer: true }), '0.0.0.0');
}

await bootstrap();
