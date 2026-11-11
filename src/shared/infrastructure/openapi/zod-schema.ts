import type { SchemaObject } from '@nestjs/swagger';
import { z } from 'zod';

type Io = 'input' | 'output';

type JsonSchema = Record<string, unknown>;

/** O `format` já diz o que é; a regex que o Zod gera só atrapalha a leitura. */
function withoutPatternOfFormat(schema: JsonSchema): void {
  if (schema['format'] !== undefined) {
    delete schema['pattern'];
  }
}

/** Todo inteiro do Zod vem com os limites do `Number.MAX_SAFE_INTEGER`. */
function withoutSafeIntegerLimits(schema: JsonSchema): void {
  if (schema['minimum'] === Number.MIN_SAFE_INTEGER) {
    delete schema['minimum'];
  }
  if (schema['maximum'] === Number.MAX_SAFE_INTEGER) {
    delete schema['maximum'];
  }
}

/** Só o que ajuda quem lê o documento. */
function withoutNoise(schema: JsonSchema): void {
  withoutPatternOfFormat(schema);
  withoutSafeIntegerLimits(schema);
}

function toOpenApi(schema: z.ZodType, io: Io): SchemaObject {
  return z.toJSONSchema(schema, {
    target: 'openapi-3.0',
    io,
    override: ({ jsonSchema }) => withoutNoise(jsonSchema),
  }) as SchemaObject;
}

/** O que o cliente manda: o texto da query antes do `coerce`, a data antes do `transform`. */
export function requestSchema(schema: z.ZodType): SchemaObject {
  return toOpenApi(schema, 'input');
}

/** O que a API devolve: só os campos do presenter, nenhum a mais. */
export function responseSchema(schema: z.ZodType): SchemaObject {
  return toOpenApi(schema, 'output');
}
