import { createFastifyAdapter } from './create-fastify-adapter.js';

type Line = { level: number; reqId?: string; msg: string; res?: object };

describe('createFastifyAdapter', () => {
  async function answer(url: string, headers: Record<string, string> = {}) {
    const lines: Line[] = [];
    const stream = { write: (line: string) => lines.push(JSON.parse(line)) };
    const fastify = createFastifyAdapter(
      { NODE_ENV: 'production', LOG_LEVEL: 'info' },
      stream,
    ).getInstance();
    fastify.get('/ping', (request) => ({ id: request.id }));
    fastify.get('/missing', (_request, reply) => reply.status(404).send({}));
    fastify.get('/health', () => ({}));
    const response = await fastify.inject({ url, headers });
    await fastify.close();
    return { response, lines: lines.filter((line) => line.reqId) };
  }

  it('should send back the id that the request got', async () => {
    const { response } = await answer('/ping');

    expect(response.headers['x-request-id']).toBe(response.json().id);
    expect(response.json().id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('should use the id that the proxy sent', async () => {
    const { response } = await answer('/ping', { 'x-request-id': 'proxy-42' });

    expect(response.headers['x-request-id']).toBe('proxy-42');
  });

  it('should log one line per request, with its id and status', async () => {
    const { lines } = await answer('/ping', { 'x-request-id': 'proxy-42' });

    expect(lines).toEqual([
      expect.objectContaining({
        level: 30,
        reqId: 'proxy-42',
        msg: 'request completed',
        res: { statusCode: 200 },
      }),
    ]);
  });

  it('should log a client error as a warning', async () => {
    const { lines } = await answer('/missing');

    expect(lines).toEqual([expect.objectContaining({ level: 40 })]);
  });

  it('should not log the health probes', async () => {
    const { lines } = await answer('/health');

    expect(lines).toEqual([]);
  });

  it('should ask the client to drop the connection when the answer goes out during the shutdown', async () => {
    const fastify = createFastifyAdapter({
      NODE_ENV: 'production',
      LOG_LEVEL: 'silent',
    }).getInstance();
    let release = (): void => {};
    let started = false;
    fastify.get('/slow', async () => {
      started = true;
      await new Promise<void>((resolve) => (release = resolve));
      return {};
    });
    let shuttingDown = false;
    fastify.addHook('preClose', async () => {
      shuttingDown = true;
    });
    const url = await fastify.listen({ port: 0, host: '127.0.0.1' });
    const inFlight = fetch(`${url}/slow`);
    await vi.waitUntil(() => started);

    const closing = fastify.close();
    await vi.waitUntil(() => shuttingDown);
    release();
    const response = await inFlight;
    await closing;

    expect(response.headers.get('connection')).toBe('close');
  });

  it('should keep the connection while the server is running', async () => {
    const { response } = await answer('/ping');

    expect(response.headers.connection).not.toBe('close');
  });
});
