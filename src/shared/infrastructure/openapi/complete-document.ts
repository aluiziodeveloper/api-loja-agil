import type {
  OpenAPIObject,
  OperationObject,
  PathItemObject,
} from '@nestjs/swagger';
import type { ErrorStatusMap } from '../http/error-response.js';
import { errorResponses } from './error-responses.js';

/** As marcas que os decorators deixam na operação para esta etapa. */
type MarkedOperation = OperationObject & {
  'x-public'?: boolean;
  'x-roles'?: string[];
  'x-error-codes'?: string[];
};

const METHODS = ['get', 'post', 'put', 'patch', 'delete'] as const;

function isValidated(operation: OperationObject): boolean {
  const inQuery = (operation.parameters ?? []).some(
    (parameter) => 'in' in parameter && parameter.in === 'query',
  );
  return operation.requestBody !== undefined || inQuery;
}

/** Na ordem em que a requisição é barrada: formato, token, perfil, domínio. */
function codesOf(operation: MarkedOperation): string[] {
  return [
    ...(isValidated(operation) ? ['VALIDATION_FAILED'] : []),
    ...(operation['x-public'] ? [] : ['UNAUTHORIZED']),
    ...(operation['x-roles'] ? ['FORBIDDEN'] : []),
    ...(operation['x-error-codes'] ?? []),
  ];
}

function rolesOf(roles: string[] | undefined): { description?: string } {
  return roles ? { description: `Perfil exigido: ${roles.join(', ')}.` } : {};
}

function responsesOf(
  operation: MarkedOperation,
  statusByCode: ErrorStatusMap,
): OperationObject['responses'] {
  return {
    ...operation.responses,
    ...errorResponses(codesOf(operation), statusByCode),
  };
}

function completeOperation(
  operation: MarkedOperation,
  statusByCode: ErrorStatusMap,
): OperationObject {
  const { 'x-public': isPublic, 'x-roles': roles, ...rest } = operation;
  delete rest['x-error-codes'];
  return {
    ...rest,
    ...rolesOf(roles),
    security: isPublic ? [] : [{ bearer: [] }],
    responses: responsesOf(operation, statusByCode),
  };
}

function completePath(
  item: PathItemObject,
  statusByCode: ErrorStatusMap,
): PathItemObject {
  const completed = { ...item };
  for (const method of METHODS) {
    const operation = item[method];
    completed[method] = operation && completeOperation(operation, statusByCode);
  }
  return completed;
}

/**
 * Segurança e erros, a partir das marcas dos decorators: rota sem `@Public()`
 * pede token, como no `AuthGuard`; cada código vira a resposta do seu status.
 */
export function completeDocument(
  document: OpenAPIObject,
  statusByCode: ErrorStatusMap,
): OpenAPIObject {
  const paths = Object.entries(document.paths).map(([path, item]) => [
    path,
    completePath(item, statusByCode),
  ]);
  return { ...document, paths: Object.fromEntries(paths) };
}
