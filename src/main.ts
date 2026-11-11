import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module.js';
import type { Env } from './config/env.schema.js';
import { setupOpenApi } from './shared/infrastructure/openapi/open-api.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  setupOpenApi(app);
  const config = app.get<ConfigService<Env, true>>(ConfigService);

  await app.listen(config.get('PORT', { infer: true }), '0.0.0.0');
}

await bootstrap();
