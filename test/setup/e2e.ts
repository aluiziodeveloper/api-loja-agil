import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { Principal } from '../../src/shared/infrastructure/auth/access-tokens.js';
import { PrismaDatabase } from '../../src/shared/infrastructure/database/prisma-database.js';
import { resetDatabase } from '../../src/shared/infrastructure/database/__tests__/reset-database.js';
import { authAs } from './auth.js';
import { createTestApp } from './create-test-app.js';
import { OpenApiConformance } from './open-api-conformance.js';
import { TestClient } from './test-client.js';

type Headers = Record<string, string>;

/**
 * Uma aplicação por arquivo de teste e um banco vazio por teste. Os clientes
 * podem ser criados no topo do `describe`, antes de a aplicação existir:
 * eles só a procuram na hora da requisição.
 */
export class E2EContext {
  private application?: NestFastifyApplication;
  private conformance?: OpenApiConformance;

  get app(): NestFastifyApplication {
    if (!this.application) {
      throw new Error('A aplicação de teste ainda não subiu.');
    }
    return this.application;
  }

  /** Sem token: o que qualquer um na internet consegue fazer. */
  get api(): TestClient {
    return this.client(async () => ({}));
  }

  /** Com um token emitido pela própria aplicação para esse usuário. */
  as(principal: Principal): TestClient {
    return this.client(() => authAs(this.app, principal));
  }

  /** Com o token que o login devolveu. */
  bearer(accessToken: string): TestClient {
    return this.client(async () => ({
      authorization: `Bearer ${accessToken}`,
    }));
  }

  /** O documento é lido uma vez, como um cliente da API o leria. */
  async start(): Promise<void> {
    this.application = await createTestApp();
    const document = await this.application.inject('/docs-json');
    this.conformance = new OpenApiConformance(document.json());
  }

  async reset(): Promise<void> {
    await resetDatabase(this.app.get(PrismaDatabase));
  }

  async stop(): Promise<void> {
    await this.application?.close();
  }

  private client(headers: () => Promise<Headers>): TestClient {
    return new TestClient({
      app: () => this.app,
      headers,
      check: (method, url, response) =>
        this.conformance?.check(method, url, response),
    });
  }
}

/** Sobe a aplicação antes do arquivo, zera o banco antes de cada teste e fecha no fim. */
export function useTestApp(): E2EContext {
  const e2e = new E2EContext();
  beforeAll(() => e2e.start());
  beforeEach(() => e2e.reset());
  afterAll(() => e2e.stop());
  return e2e;
}
