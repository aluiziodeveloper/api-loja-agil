import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { Logger } from 'nestjs-pino';
import { AppModule } from '../../src/app.module.js';
import { appErrorStatus } from '../../src/app-error-status.js';
import { createFastifyAdapter } from '../../src/shared/infrastructure/http/create-fastify-adapter.js';
import { setupOpenApi } from '../../src/shared/infrastructure/openapi/open-api.js';

/** Silencioso nos testes; `LOG_LEVEL=info` mostra as linhas ao investigar. */
const TEST_LOGGING = {
  NODE_ENV: 'test',
  LOG_LEVEL: process.env.LOG_LEVEL === 'info' ? 'info' : 'silent',
} as const;

/** A aplicação inteira, como no `main.ts`, pronta para receber `inject`. */
export async function createTestApp(): Promise<NestFastifyApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  const app = moduleRef.createNestApplication<NestFastifyApplication>(
    createFastifyAdapter(TEST_LOGGING),
  );
  app.useLogger(app.get(Logger));
  setupOpenApi(app, appErrorStatus);
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
  return app;
}
