import { HttpStatus } from '@nestjs/common';
import type { OpenAPIObject, OperationObject } from '@nestjs/swagger';
import { completeDocument } from './complete-document.js';

const statusByCode = {
  INVALID_ID: HttpStatus.BAD_REQUEST,
  INVALID_SKU: HttpStatus.BAD_REQUEST,
  PRODUCT_NOT_FOUND: HttpStatus.NOT_FOUND,
};

function documentWith(operation: object): OpenAPIObject {
  return {
    openapi: '3.0.0',
    info: { title: 'Teste', version: '1.0' },
    paths: { '/products': { post: { responses: {}, ...operation } } },
  };
}

function completed(operation: object): OperationObject {
  const { paths } = completeDocument(documentWith(operation), statusByCode);
  return paths['/products']?.post as OperationObject;
}

function codesAt(operation: OperationObject, status: number): unknown {
  return operation.responses[status];
}

function errorWith(codes: string[]): object {
  return expect.objectContaining({
    content: {
      'application/json': {
        schema: expect.objectContaining({
          properties: {
            error: expect.objectContaining({
              properties: expect.objectContaining({
                code: { type: 'string', enum: codes },
              }),
            }),
          },
        }),
      },
    },
  });
}

describe('completeDocument', () => {
  it('should ask for a token by default, as the guard does', () => {
    const operation = completed({});

    expect(operation.security).toEqual([{ bearer: [] }]);
    expect(codesAt(operation, 401)).toEqual(errorWith(['UNAUTHORIZED']));
  });

  it('should open a public route', () => {
    const operation = completed({ 'x-public': true });

    expect(operation.security).toEqual([]);
    expect(codesAt(operation, 401)).toBeUndefined();
  });

  it('should refuse the other roles of a route with roles', () => {
    const operation = completed({ 'x-roles': ['OPERATOR'] });

    expect(codesAt(operation, 403)).toEqual(errorWith(['FORBIDDEN']));
    expect(operation.description).toBe('Perfil exigido: OPERATOR.');
  });

  it('should group the declared codes by their status', () => {
    const operation = completed({
      'x-error-codes': ['INVALID_ID', 'INVALID_SKU', 'PRODUCT_NOT_FOUND'],
    });

    expect(codesAt(operation, 400)).toEqual(
      errorWith(['INVALID_ID', 'INVALID_SKU']),
    );
    expect(codesAt(operation, 404)).toEqual(errorWith(['PRODUCT_NOT_FOUND']));
  });

  it('should add the validation error to a route with a body', () => {
    const operation = completed({
      requestBody: { content: {} },
      'x-error-codes': ['INVALID_SKU'],
    });

    expect(codesAt(operation, 400)).toEqual(
      errorWith(['VALIDATION_FAILED', 'INVALID_SKU']),
    );
  });

  it('should add the validation error to a route with a query', () => {
    const operation = completed({
      parameters: [{ name: 'page', in: 'query' }],
    });

    expect(codesAt(operation, 400)).toEqual(errorWith(['VALIDATION_FAILED']));
  });

  it('should refuse a code without a status', () => {
    expect(() => completed({ 'x-error-codes': ['NO_SUCH_CODE'] })).toThrow(
      'O código NO_SUCH_CODE não tem status em nenhum mapa de erros.',
    );
  });

  it('should leave none of its marks in the document', () => {
    const operation = completed({
      'x-public': true,
      'x-roles': ['OPERATOR'],
      'x-error-codes': ['INVALID_ID'],
    });

    expect(
      Object.keys(operation).filter((key) => key.startsWith('x-')),
    ).toEqual([]);
  });
});
