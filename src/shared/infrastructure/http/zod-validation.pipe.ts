import type { PipeTransform } from '@nestjs/common';
import { z } from 'zod';
import {
  RequestValidationError,
  type ValidationIssue,
} from './request-validation.error.js';

// As mensagens do Zod chegam ao cliente da API: em português, como as do domínio.
z.config(z.locales.pt());

function toIssue(issue: z.core.$ZodIssue): ValidationIssue {
  return { path: issue.path.join('.'), message: issue.message };
}

/**
 * Confere o formato da entrada na borda e entrega ao controller o valor já
 * convertido. As regras de negócio continuam nos Value Objects do domínio.
 */
export class ZodValidationPipe<Output> implements PipeTransform<
  unknown,
  Output
> {
  constructor(private readonly schema: z.ZodType<Output>) {}

  transform(value: unknown): Output {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new RequestValidationError(result.error.issues.map(toIssue));
    }
    return result.data;
  }
}
