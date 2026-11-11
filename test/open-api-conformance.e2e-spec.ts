import type { OpenAPIObject } from '@nestjs/swagger';
import { OpenApiConformance } from './setup/open-api-conformance.js';

const document: OpenAPIObject = {
  openapi: '3.0.0',
  info: { title: 'Teste', version: '1.0' },
  paths: {
    '/products/{id}': {
      get: {
        operationId: 'getProduct',
        responses: {
          '200': {
            description: 'Sucesso.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: { id: { type: 'string', format: 'uuid' } },
                      required: ['id'],
                      additionalProperties: false,
                    },
                  },
                  required: ['data'],
                },
              },
            },
          },
          '204': { description: 'Sem corpo.' },
        },
      },
    },
  },
};

const ID = '0199b7a4-5b7e-7cc0-8000-000000000001';

function response(
  statusCode: number,
  body: unknown,
): {
  statusCode: number;
  body: string;
} {
  return { statusCode, body: body === undefined ? '' : JSON.stringify(body) };
}

describe('OpenApiConformance', () => {
  const conformance = new OpenApiConformance(document);

  it('should accept a response as the document describes it', () => {
    expect(() =>
      conformance.check(
        'GET',
        `/products/${ID}`,
        response(200, { data: { id: ID } }),
      ),
    ).not.toThrow();
  });

  it('should refuse a status the route does not document', () => {
    expect(() =>
      conformance.check('GET', `/products/${ID}`, response(409, {})),
    ).toThrow(
      `GET /products/${ID} respondeu 409, que o documento de getProduct não tem (200, 204).`,
    );
  });

  it('should refuse a body out of the schema', () => {
    expect(() =>
      conformance.check(
        'GET',
        `/products/${ID}`,
        response(200, { data: { id: ID, secret: 'x' } }),
      ),
    ).toThrow(
      /respondeu 200 fora do documento de getProduct: .*additional properties/,
    );
  });

  it('should refuse a body where the document has none', () => {
    expect(() =>
      conformance.check('GET', `/products/${ID}`, response(204, { data: {} })),
    ).toThrow(
      'respondeu 204 fora do documento de getProduct: corpo onde o documento não tem schema.',
    );
  });

  it('should ignore a request outside the API, as the document itself', () => {
    expect(() =>
      conformance.check('GET', '/docs-json?x=1', response(200, {})),
    ).not.toThrow();
  });
});
