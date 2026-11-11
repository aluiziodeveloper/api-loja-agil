import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { map, type Observable } from 'rxjs';
import { Page, type PageMeta } from './page.js';

export type Envelope<Data> = { data: Data; meta?: PageMeta };

function toEnvelope(data: unknown): Envelope<unknown> | undefined {
  if (data instanceof Page) {
    return { data: data.items, meta: data.meta };
  }
  return data === undefined ? undefined : { data };
}

/**
 * Toda resposta de sucesso sai como `{ data }`, e uma página como
 * `{ data, meta }`: o cliente sabe onde procurar. Sem corpo (204), nada a
 * envelopar.
 */
export class EnvelopeInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<Envelope<unknown> | undefined> {
    return next.handle().pipe(map(toEnvelope));
  }
}
