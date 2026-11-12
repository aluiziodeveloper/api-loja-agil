import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { type ErrorStatusMap, toErrorResponse } from './error-response.js';

/** No log da requisição, com o id dela e a pilha; nunca na resposta. */
function logFailure(request: FastifyRequest, exception: unknown): void {
  const failure =
    exception instanceof Error ? exception : new Error(String(exception));
  request.log.error({ err: failure }, failure.message);
}

/** O filtro global: qualquer exceção sai como `{ error: { code, message } }`. */
@Catch()
export class ErrorResponseFilter implements ExceptionFilter {
  constructor(private readonly statusByCode: ErrorStatusMap) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { status, body } = toErrorResponse(exception, this.statusByCode);
    const http = host.switchToHttp();
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      logFailure(http.getRequest<FastifyRequest>(), exception);
    }
    void http.getResponse<FastifyReply>().status(status).send({ error: body });
  }
}
