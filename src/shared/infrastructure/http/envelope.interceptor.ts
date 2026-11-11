import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { map, type Observable } from 'rxjs';

export type Envelope<Data> = { data: Data };

/**
 * Toda resposta de sucesso sai como `{ data }`: o cliente sabe onde procurar,
 * e há lugar para acrescentar `meta` sem mudar o formato. Sem corpo (204),
 * nada a envelopar.
 */
export class EnvelopeInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<Envelope<unknown> | undefined> {
    return next
      .handle()
      .pipe(
        map((data: unknown) => (data === undefined ? undefined : { data })),
      );
  }
}
