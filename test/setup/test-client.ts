import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { Principal } from '../../src/shared/infrastructure/auth/access-tokens.js';
import { authAs } from './auth.js';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type Headers = Record<string, string>;

type Response = Awaited<ReturnType<NestFastifyApplication['inject']>>;

/**
 * Quem faz a requisição, e não como ela é montada: `ana.post('/orders')`
 * no lugar de `app.inject({ method, url, headers })`. O teste passa a ler
 * como a jornada de quem usa a API.
 */
export class TestClient {
  private constructor(
    private readonly app: NestFastifyApplication,
    private readonly headers: Headers,
  ) {}

  /** Sem token: o que qualquer um na internet consegue fazer. */
  static anonymous(app: NestFastifyApplication): TestClient {
    return new TestClient(app, {});
  }

  /** Com um token emitido pela própria aplicação para esse usuário. */
  static async as(
    app: NestFastifyApplication,
    principal: Principal,
  ): Promise<TestClient> {
    return new TestClient(app, await authAs(app, principal));
  }

  /** Com o token que o login devolveu. */
  static bearer(app: NestFastifyApplication, accessToken: string): TestClient {
    return new TestClient(app, { authorization: `Bearer ${accessToken}` });
  }

  get(url: string): Promise<Response> {
    return this.request('GET', url);
  }

  post(url: string, payload?: object): Promise<Response> {
    return this.request('POST', url, payload);
  }

  put(url: string, payload?: object): Promise<Response> {
    return this.request('PUT', url, payload);
  }

  patch(url: string, payload?: object): Promise<Response> {
    return this.request('PATCH', url, payload);
  }

  delete(url: string): Promise<Response> {
    return this.request('DELETE', url);
  }

  request(method: Method, url: string, payload?: object): Promise<Response> {
    return this.app.inject({ method, url, headers: this.headers, payload });
  }
}

/** O conteúdo do envelope `{ data }` de uma resposta de sucesso. */
export function dataOf<Data>(response: Response): Data {
  return response.json<{ data: Data }>().data;
}
