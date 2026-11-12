import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { PrismaDatabase } from '../src/shared/infrastructure/database/prisma-database.js';
import { createTestApp } from './setup/create-test-app.js';

/**
 * O que a plataforma faz num deploy: manda a instância velha encerrar
 * enquanto ainda há requisição em andamento. Aqui com um servidor de verdade,
 * numa porta, porque o `inject` não passa pelo `close` do servidor.
 */
describe('graceful shutdown (e2e)', () => {
  let app: NestFastifyApplication;
  let url: string;
  const events: string[] = [];

  beforeEach(async () => {
    events.length = 0;
    app = await createTestApp();
    await app.listen(0, '127.0.0.1');
    url = await app.getUrl();
    const database = app.get(PrismaDatabase);
    const ping = database.ping.bind(database);
    const disconnect = database.disconnect.bind(database);
    vi.spyOn(database, 'ping').mockImplementation(async () => {
      events.push('request started');
      await new Promise((resolve) => setTimeout(resolve, 300));
      await ping();
      events.push('request finished');
    });
    vi.spyOn(database, 'disconnect').mockImplementation(async () => {
      events.push('database disconnected');
      await disconnect();
    });
  });

  /** Devolve quando a requisição já está dentro da aplicação, sem esperar a resposta. */
  async function startRequest(): Promise<{ response: Promise<Response> }> {
    const response = fetch(`${url}/health/ready`);
    await vi.waitUntil(() => events.includes('request started'));
    return { response };
  }

  it('should answer the request in flight before closing the database', async () => {
    const inFlight = await startRequest();

    const closing = app.close();
    const response = await inFlight.response;
    await closing;

    expect(response.status).toBe(200);
    expect(events).toEqual([
      'request started',
      'request finished',
      'database disconnected',
    ]);
  });

  it('should refuse a new connection once the shutdown has started', async () => {
    const inFlight = await startRequest();

    const closing = app.close();
    const late = fetch(`${url}/health`);

    await expect(late).rejects.toThrow('fetch failed');
    expect((await inFlight.response).status).toBe(200);
    await closing;
  });
});
