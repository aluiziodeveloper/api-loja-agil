import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiQuery, ApiResponse } from '@nestjs/swagger';
import type { SchemaObject } from '@nestjs/swagger';
import { z } from 'zod';
import { pageMetaResponse } from '../http/page.js';
import { requestSchema, responseSchema } from './zod-schema.js';

function envelope(properties: Record<string, SchemaObject>): SchemaObject {
  return { type: 'object', properties, required: Object.keys(properties) };
}

/** O corpo da requisição, pelo mesmo schema que o `ZodValidationPipe` confere. */
export function ApiBodyOf(schema: z.ZodType): MethodDecorator {
  return ApiBody({ schema: requestSchema(schema) });
}

/** Um parâmetro de query por campo do schema, com o tipo que chega no texto. */
export function ApiQueryOf(schema: z.ZodObject): MethodDecorator {
  const { properties = {}, required = [] } = requestSchema(schema);
  return applyDecorators(
    ...Object.entries(properties).map(([name, property]) =>
      ApiQuery({ name, required: required.includes(name), schema: property }),
    ),
  );
}

/** A resposta de sucesso em `{ data }`, com o schema do presenter. */
export function ApiData(
  schema: z.ZodType,
  status: HttpStatus = HttpStatus.OK,
): MethodDecorator {
  return ApiResponse({
    status,
    description: 'Sucesso.',
    schema: envelope({ data: responseSchema(schema) }),
  });
}

/** Uma página em `{ data, meta }`: os itens e o que é preciso para navegar. */
export function ApiPage(item: z.ZodType): MethodDecorator {
  return ApiResponse({
    status: HttpStatus.OK,
    description: 'Uma página de resultados.',
    schema: envelope({
      data: responseSchema(z.array(item)),
      meta: responseSchema(pageMetaResponse),
    }),
  });
}

/** Sucesso sem corpo: nada a envelopar. */
export function ApiNoContent(): MethodDecorator {
  return ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Sem corpo.',
  });
}
