import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module.js';
import { setupOpenApi } from '../../src/shared/infrastructure/openapi/open-api.js';

/** A aplicação inteira, como no `main.ts`, pronta para receber `inject`. */
export async function createTestApp(): Promise<NestFastifyApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter(),
  );
  setupOpenApi(app);
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
  return app;
}
