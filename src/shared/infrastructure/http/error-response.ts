import { HttpException, HttpStatus } from '@nestjs/common';
import { DomainError } from '../../domain/domain-error.js';
import type { ValidationIssue } from './request-validation.error.js';

/** O status HTTP de cada código de erro de domínio (docs/error-codes.md). */
export type ErrorStatusMap = Readonly<Record<string, HttpStatus>>;

export type ErrorBody = {
  code: string;
  message: string;
  details?: ValidationIssue[];
};

export type ErrorResponse = {
  status: HttpStatus;
  body: ErrorBody;
};

const INTERNAL_ERROR: ErrorResponse = {
  status: HttpStatus.INTERNAL_SERVER_ERROR,
  body: {
    code: 'INTERNAL_ERROR',
    message: 'Erro interno. Tente de novo mais tarde.',
  },
};

function isErrorBody(value: unknown): value is ErrorBody {
  return typeof value === 'object' && value !== null && 'code' in value;
}

/** Sem status na tabela, o erro é tratado como falha nossa, não do cliente. */
function fromDomainError(
  error: DomainError,
  statusByCode: ErrorStatusMap,
): ErrorResponse {
  return {
    status: statusByCode[error.code] ?? HttpStatus.INTERNAL_SERVER_ERROR,
    body: { code: error.code, message: error.message },
  };
}

function fromHttpException(exception: HttpException): ErrorResponse {
  const status = exception.getStatus();
  const response = exception.getResponse();
  if (isErrorBody(response)) {
    return { status, body: response };
  }
  const code = HttpStatus[status] ?? `HTTP_${status}`;
  return { status, body: { code, message: exception.message } };
}

/**
 * Toda falha vira o mesmo formato de resposta. Um erro inesperado não expõe
 * a mensagem nem a pilha: elas vão para o log, não para o cliente.
 */
export function toErrorResponse(
  exception: unknown,
  statusByCode: ErrorStatusMap,
): ErrorResponse {
  if (exception instanceof DomainError) {
    return fromDomainError(exception, statusByCode);
  }
  if (exception instanceof HttpException) {
    return fromHttpException(exception);
  }
  return INTERNAL_ERROR;
}
