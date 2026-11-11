import type {
  OpenAPIObject,
  OperationObject,
  ResponseObject,
} from '@nestjs/swagger';
import { Ajv, type ValidateFunction } from 'ajv';
import addFormatsModule from 'ajv-formats';

type Answer = { statusCode: number; body: string };

type Route = { method: string; pattern: RegExp; operation: OperationObject };

const addFormats = addFormatsModule.default;

/** `/orders/{id}/items/{sku}` vira uma regex; caminho literal vem antes. */
function routesOf(document: OpenAPIObject): Route[] {
  return Object.entries(document.paths)
    .sort(([left], [right]) => left.split('{').length - right.split('{').length)
    .flatMap(([path, item]) =>
      Object.entries(item as Record<string, OperationObject>).map(
        ([method, operation]) => ({
          method: method.toUpperCase(),
          pattern: new RegExp(`^${path.replace(/\{[^}]+\}/g, '[^/]+')}$`),
          operation,
        }),
      ),
    );
}

function schemaOf(response: ResponseObject): object | undefined {
  return response.content?.['application/json']?.schema;
}

function undocumented(
  answered: string,
  { operationId, responses }: OperationObject,
): Error {
  const statuses = Object.keys(responses).join(', ');
  return new Error(
    `${answered}, que o documento de ${operationId} não tem (${statuses}).`,
  );
}

function checkEmpty(failure: string, body: string): void {
  if (body !== '') {
    throw new Error(`${failure}: corpo onde o documento não tem schema.`);
  }
}

/**
 * Confere cada resposta dos e2e contra o documento OpenAPI: o status tem de
 * estar documentado na rota, e o corpo, caber no schema daquele status.
 * Rota fora do documento (o próprio `/docs`, uma rota que não existe) passa.
 */
export class OpenApiConformance {
  private readonly routes: Route[];
  private readonly ajv = addFormats(new Ajv({ allErrors: true }));
  private readonly validators = new Map<object, ValidateFunction>();

  constructor(document: OpenAPIObject) {
    this.routes = routesOf(document);
  }

  check(method: string, url: string, answer: Answer): void {
    const path = url.split('?')[0] ?? url;
    const route = this.routes.find(
      (candidate) =>
        candidate.method === method && candidate.pattern.test(path),
    );
    const answered = `${method} ${url} respondeu ${answer.statusCode}`;
    if (route) {
      this.checkAnswer(answered, route.operation, answer);
    }
  }

  private checkAnswer(
    answered: string,
    operation: OperationObject,
    { statusCode, body }: Answer,
  ): void {
    const documented = operation.responses[statusCode];
    if (!documented) {
      throw undocumented(answered, operation);
    }
    const failure = `${answered} fora do documento de ${operation.operationId}`;
    this.checkBody(failure, schemaOf(documented as ResponseObject), body);
  }

  private checkBody(
    failure: string,
    schema: object | undefined,
    body: string,
  ): void {
    if (!schema) {
      checkEmpty(failure, body);
      return;
    }
    const validate = this.validatorOf(schema);
    if (!validate(JSON.parse(body))) {
      throw new Error(`${failure}: ${this.ajv.errorsText(validate.errors)}`);
    }
  }

  private validatorOf(schema: object): ValidateFunction {
    const validate = this.validators.get(schema) ?? this.ajv.compile(schema);
    this.validators.set(schema, validate);
    return validate;
  }
}
