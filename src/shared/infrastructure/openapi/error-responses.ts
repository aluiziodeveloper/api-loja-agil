import { HttpStatus } from '@nestjs/common';
import type { ResponseObject } from '@nestjs/swagger';
import { z } from 'zod';
import type { ErrorStatusMap } from '../http/error-response.js';
import { responseSchema } from './zod-schema.js';

/** Os erros da própria borda HTTP: validação e os dois guards. */
const edgeErrorStatus: ErrorStatusMap = {
  VALIDATION_FAILED: HttpStatus.BAD_REQUEST,
  UNAUTHORIZED: HttpStatus.UNAUTHORIZED,
  FORBIDDEN: HttpStatus.FORBIDDEN,
};

/** O envelope `{ error }`, com só os códigos possíveis naquele status. */
function errorResponse(codes: string[]): ResponseObject {
  const issue = z.object({ path: z.string(), message: z.string() });
  const body = z.object({
    error: z.object({
      code: z.enum(codes),
      message: z.string(),
      details: z.array(issue).optional(),
    }),
  });
  const schema = responseSchema(body);
  return {
    description: codes.join(', '),
    content: { 'application/json': { schema } },
  };
}

function statusOf(code: string, statusByCode: ErrorStatusMap): HttpStatus {
  const status = statusByCode[code] ?? edgeErrorStatus[code];
  if (status === undefined) {
    throw new Error(`O código ${code} não tem status em nenhum mapa de erros.`);
  }
  return status;
}

/** Uma resposta por status, com os códigos que caem nele. */
export function errorResponses(
  codes: string[],
  statusByCode: ErrorStatusMap,
): Record<string, ResponseObject> {
  const byStatus: Record<string, string[]> = {};
  for (const code of codes) {
    (byStatus[statusOf(code, statusByCode)] ??= []).push(code);
  }
  return Object.fromEntries(
    Object.entries(byStatus).map(([status, grouped]) => [
      status,
      errorResponse(grouped),
    ]),
  );
}
