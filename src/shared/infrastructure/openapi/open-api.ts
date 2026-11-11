import type { INestApplication } from '@nestjs/common';
import {
  DocumentBuilder,
  type OpenAPIObject,
  SwaggerModule,
} from '@nestjs/swagger';
import type { ErrorStatusMap } from '../http/error-response.js';
import { completeDocument } from './complete-document.js';

/** A interface fica em `/docs`; o documento, em `/docs-json`. */
export const OPEN_API_PATH = 'docs';

const config = new DocumentBuilder()
  .setTitle('API Loja Ágil')
  .setDescription('Catálogo, estoque, pedidos e identidade da Loja Ágil.')
  .setVersion('1.0')
  .addTag('Catálogo', 'Produtos à venda e a busca da vitrine.')
  .addTag('Estoque', 'Entradas, ajustes e nível mínimo por SKU.')
  .addTag('Pedidos', 'Do rascunho ao despacho, com cupons de desconto.')
  .addTag('Identidade', 'Cadastro, login, perfil e operadores.')
  .addTag('Saúde', 'Se a aplicação está no ar.')
  .addBearerAuth(
    { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    'bearer',
  )
  .build();

/**
 * Um controller por caso de uso: `CreateProductController` vira a operação
 * `createProduct`, o nome que um gerador de cliente vai usar.
 */
export function operationIdOf(controllerKey: string): string {
  const useCase = controllerKey.replace(/Controller$/, '');
  return useCase.charAt(0).toLowerCase() + useCase.slice(1);
}

/**
 * O documento que o Nest monta a partir das rotas registradas, completado
 * com a segurança e com o status de cada código de erro.
 */
export function createOpenApiDocument(
  app: INestApplication,
  statusByCode: ErrorStatusMap,
): OpenAPIObject {
  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: operationIdOf,
  });
  return completeDocument(document, statusByCode);
}

/** Antes do `init`: o Swagger registra as próprias rotas no Fastify. */
export function setupOpenApi(
  app: INestApplication,
  statusByCode: ErrorStatusMap,
): void {
  SwaggerModule.setup(
    OPEN_API_PATH,
    app,
    () => createOpenApiDocument(app, statusByCode),
    // O token colado em "Authorize" sobrevive ao recarregar a página.
    { swaggerOptions: { persistAuthorization: true } },
  );
}
