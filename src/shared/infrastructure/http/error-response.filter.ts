import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { type ErrorStatusMap, toErrorResponse } from './error-response.js';

/** O filtro global: qualquer exceção sai como `{ error: { code, message } }`. */
@Catch()
export class ErrorResponseFilter implements ExceptionFilter {
  private readonly logger = new Logger(ErrorResponseFilter.name);

  constructor(private readonly statusByCode: ErrorStatusMap) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { status, body } = toErrorResponse(exception, this.statusByCode);
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logFailure(exception);
    }
    void host
      .switchToHttp()
      .getResponse<FastifyReply>()
      .status(status)
      .send({ error: body });
  }

  private logFailure(exception: unknown): void {
    const failure =
      exception instanceof Error ? exception : new Error(String(exception));
    this.logger.error(failure.message, failure.stack);
  }
}
