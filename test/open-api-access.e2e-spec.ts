import type {
  OpenAPIObject,
  OperationObject,
  ResponseObject,
} from '@nestjs/swagger';
import { useTestApp } from './setup/e2e.js';

type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';

describe('OpenAPI access and errors (e2e)', () => {
  const e2e = useTestApp();
  let document: OpenAPIObject;

  beforeEach(async () => {
    document = (await e2e.api.get('/docs-json')).json<OpenAPIObject>();
  });

  function operations(): [string, OperationObject][] {
    return Object.entries(document.paths).flatMap(([path, item]) =>
      Object.entries(item as Record<Method, OperationObject>).map(
        ([method, operation]): [string, OperationObject] => [
          `${method.toUpperCase()} ${path}`,
          operation,
        ],
      ),
    );
  }

  function codesOf(route: string, status: number): unknown {
    const [, operation] = operations().find(([name]) => name === route) ?? [];
    const response = operation?.responses[status] as ResponseObject | undefined;
    const schema = response?.content?.['application/json']?.schema as {
      properties: { error: { properties: { code: object } } };
    };
    return schema?.properties.error.properties.code;
  }

  it('should declare the bearer token of the sign-in', () => {
    expect(document.components?.securitySchemes).toEqual({
      bearer: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    });
  });

  it('should open only the public routes', () => {
    const open = operations()
      .filter(([, operation]) => operation.security?.length === 0)
      .map(([route]) => route);

    expect(open.sort()).toEqual([
      'GET /health',
      'GET /health/ready',
      'GET /products',
      'GET /products/{id}',
      'POST /auth/sign-in',
      'POST /users',
    ]);
  });

  it('should list the codes of each status of a route', () => {
    expect(codesOf('POST /products', 400)).toEqual({
      type: 'string',
      enum: [
        'VALIDATION_FAILED',
        'INVALID_SKU',
        'INVALID_PRODUCT_NAME',
        'INVALID_MONEY',
      ],
    });
    expect(codesOf('POST /products', 403)).toEqual({
      type: 'string',
      enum: ['FORBIDDEN'],
    });
    expect(codesOf('POST /orders/{id}/place', 422)).toEqual({
      type: 'string',
      enum: ['EMPTY_ORDER', 'COUPON_NOT_APPLICABLE', 'STOCK_SHORTAGE'],
    });
  });

  it('should summarize every operation', () => {
    const unsummarized = operations()
      .filter(([, operation]) => !operation.summary)
      .map(([route]) => route);

    expect(unsummarized).toEqual([]);
  });
});
