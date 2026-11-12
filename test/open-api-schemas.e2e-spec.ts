import type {
  OpenAPIObject,
  OperationObject,
  ResponseObject,
} from '@nestjs/swagger';
import { createProductBody } from '../src/catalog/infrastructure/http/create-product.controller.js';
import { productResponse } from '../src/catalog/infrastructure/http/product.presenter.js';
import {
  requestSchema,
  responseSchema,
} from '../src/shared/infrastructure/openapi/zod-schema.js';
import { useTestApp } from './setup/e2e.js';

type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';

describe('OpenAPI schemas (e2e)', () => {
  const e2e = useTestApp();
  let document: OpenAPIObject;

  beforeEach(async () => {
    document = (await e2e.api.get('/docs-json')).json<OpenAPIObject>();
  });

  function operation(path: string, method: Method): OperationObject {
    const found = document.paths[path]?.[method];
    if (!found) {
      throw new Error(`${method.toUpperCase()} ${path} não está no documento.`);
    }
    return found;
  }

  function jsonOf(response: unknown): unknown {
    return (response as ResponseObject).content?.['application/json']?.schema;
  }

  it('should describe the body with the Zod schema of the controller', () => {
    const { requestBody } = operation('/products', 'post');

    expect(jsonOf(requestBody)).toEqual(requestSchema(createProductBody));
  });

  it('should wrap the presenter in the envelope', () => {
    const { responses } = operation('/products', 'post');

    expect(jsonOf(responses['201'])).toEqual({
      type: 'object',
      properties: { data: responseSchema(productResponse) },
      required: ['data'],
    });
  });

  it('should describe a page with its meta', () => {
    const { responses } = operation('/products', 'get');

    expect(jsonOf(responses['200'])).toMatchObject({
      properties: {
        data: { type: 'array', items: responseSchema(productResponse) },
        meta: { required: ['total', 'page', 'perPage', 'lastPage'] },
      },
      required: ['data', 'meta'],
    });
  });

  it('should describe each query parameter of a search', () => {
    const { parameters } = operation('/products', 'get');

    expect(parameters).toContainEqual({
      name: 'includeInactive',
      in: 'query',
      required: false,
      schema: { type: 'string' },
    });
  });

  it('should list the fields a search can be sorted by', () => {
    expect(operation('/products', 'get').parameters).toContainEqual({
      name: 'sort',
      in: 'query',
      required: false,
      schema: {
        type: 'string',
        enum: ['name', 'price', 'sku'],
        default: 'name',
      },
    });
    expect(operation('/users', 'get').parameters).toContainEqual({
      name: 'sort',
      in: 'query',
      required: false,
      schema: { type: 'string', enum: ['name', 'email'], default: 'name' },
    });
  });

  it('should list the directions of every search', () => {
    const searches = [
      operation('/products', 'get'),
      operation('/users', 'get'),
      operation('/orders', 'get'),
      operation('/stock/{sku}/movements', 'get'),
    ];

    for (const { parameters } of searches) {
      expect(parameters).toContainEqual({
        name: 'sortDirection',
        in: 'query',
        required: false,
        schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' },
      });
    }
  });

  it('should say that a response without body has none', () => {
    const { responses } = operation('/me', 'delete');

    expect(responses['204']).toBeDefined();
    expect(jsonOf(responses['204'])).toBeUndefined();
  });

  it('should document the success of every operation', () => {
    const undocumented = Object.entries(document.paths).flatMap(
      ([path, item]) =>
        Object.entries(item)
          .filter(([, op]) => {
            const success = Object.entries(
              (op as OperationObject).responses,
            ).find(([status]) => status.startsWith('2'));
            return !success || (success[0] !== '204' && !jsonOf(success[1]));
          })
          .map(([method]) => `${method.toUpperCase()} ${path}`),
    );

    expect(undocumented).toEqual([]);
  });
});
