import type { NestFastifyApplication } from '@nestjs/platform-fastify';

export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type Headers = Record<string, string>;

export type TestResponse = Awaited<
  ReturnType<NestFastifyApplication['inject']>
>;

/**
 * O que o cliente precisa só na hora da requisição: a aplicação, os headers
 * e quem confere a resposta contra o documento OpenAPI.
 */
export type Connection = {
  app: () => NestFastifyApplication;
  headers: () => Promise<Headers>;
  check: (method: Method, url: string, response: TestResponse) => void;
};

/**
 * Quem faz a requisição, e não como ela é montada: `ana.post('/orders')`
 * no lugar de `app.inject({ method, url, headers })`. O teste passa a ler
 * como a jornada de quem usa a API.
 */
export class TestClient {
  constructor(private readonly connection: Connection) {}

  get(url: string): Promise<TestResponse> {
    return this.request('GET', url);
  }

  post(url: string, payload?: object): Promise<TestResponse> {
    return this.request('POST', url, payload);
  }

  put(url: string, payload?: object): Promise<TestResponse> {
    return this.request('PUT', url, payload);
  }

  patch(url: string, payload?: object): Promise<TestResponse> {
    return this.request('PATCH', url, payload);
  }

  delete(url: string): Promise<TestResponse> {
    return this.request('DELETE', url);
  }

  async request(
    method: Method,
    url: string,
    payload?: object,
  ): Promise<TestResponse> {
    const headers = await this.connection.headers();
    const response = await this.connection
      .app()
      .inject({ method, url, headers, payload });
    this.connection.check(method, url, response);
    return response;
  }
}

/** O conteúdo do envelope `{ data }` de uma resposta de sucesso. */
export function dataOf<Data>(response: TestResponse): Data {
  return response.json<{ data: Data }>().data;
}
