# 0016. Documentação OpenAPI a partir dos schemas Zod

- **Status:** aceita
- **Data:** 2026-11-11

## Contexto

A API tem 33 rotas, e cada uma já declara o formato do que recebe (um schema Zod no controller, conferido pelo `ZodValidationPipe`) e do que devolve (o presenter, um schema Zod que é lista branca de campos). O status de cada código de erro está nos mapas de cada contexto, juntados em `appErrorStatus`. Faltava um documento que um cliente da API pudesse ler ou usar para gerar código. O caminho comum no NestJS, DTOs em classe com `class-validator` e decorators em cada campo, criaria uma segunda descrição de cada formato, que ninguém obriga a ficar igual à primeira.

## Decisão

- **`@nestjs/swagger`, sem DTOs em classe.** O documento fica em `/docs-json`, e o Swagger UI, em `/docs`, montados por `setupOpenApi(app, appErrorStatus)` no `main.ts` e no `createTestApp()`.
- **Uma fonte só: os schemas Zod que a API já usa.** `requestSchema` e `responseSchema` (`src/shared/infrastructure/openapi/zod-schema.ts`) convertem com `z.toJSONSchema` para OpenAPI 3.0: a entrada como o cliente a manda (antes do `coerce` e do `transform`), a saída só com os campos do presenter. A regex de um `format` conhecido e os limites de inteiro seguro ficam de fora, porque só atrapalham a leitura.
- **Decorators curtos em cada rota:** `ApiBodyOf`, `ApiQueryOf`, `ApiData` (com o envelope `{ data }`), `ApiPage` (`{ data, meta }`), `ApiNoContent`, `ApiErrors(...códigos)` e o resumo em `ApiOperation`. O status de sucesso vai explícito no `ApiData`, porque o Swagger para de inferir o padrão quando a rota declara qualquer resposta.
- **Nome e grupo:** a operação se chama como o caso de uso (`CreateProductController` vira `createProduct`), e as rotas se agrupam por contexto (`@ApiTags`).
- **Negar por padrão, também no documento.** Toda rota pede o token Bearer, menos as marcadas com `@Public()`: a mesma marca abre a rota no `AuthGuard` e no documento. `@Roles()` mostra o perfil exigido e o 403.
- **Erros pelo código, status pelo mapa.** O controller só lista os códigos que a rota pode devolver. `completeDocument` resolve o status de cada um com `appErrorStatus`, na montagem, e junta numa resposta por status, com os códigos possíveis em `enum`. Assim, a confirmação do pedido mostra o `STOCK_SHORTAGE` do Estoque sem que Pedidos importe o Estoque. Um código sem status impede o documento de ser montado. `VALIDATION_FAILED` (rota com corpo ou query), `UNAUTHORIZED` e `FORBIDDEN` entram sozinhos.
- **Os e2e conferem o documento.** Cada resposta que um e2e recebe pelo `TestClient` é conferida por `OpenApiConformance` (`test/setup/open-api-conformance.ts`, com Ajv): o status tem de estar documentado na rota, e o corpo, caber no schema daquele status.

## Consequências

- Mudar um schema de entrada ou um presenter muda o documento, sem um segundo passo. Esquecer de documentar um erro novo derruba o e2e que o provoca.
- O corpo de entrada documenta só o formato que a borda confere (`priceInCents` é `number`). As regras ficam nos Value Objects (D22) e aparecem no documento como os códigos de erro da rota.
- A lista de códigos de cada rota é escrita à mão. A conferência só pega o que algum e2e exercita: um código que nenhum e2e provoca pode faltar (ou sobrar) sem que nada falhe.
- As 4 requisições que os e2e fazem direto com `app.inject` (headers crus, corpo que não é JSON) não passam pela conferência.
- O `/docs` é público e fica ligado em todos os ambientes, como as rotas públicas da própria API. Desligá-lo em produção é uma linha no `main.ts`, se um dia for preciso.
- Os schemas saem embutidos em cada operação, sem `components/schemas` com nome. Um gerador de cliente cria tipos com nomes derivados da operação; nomear os schemas é o próximo passo, se algum cliente pedir.
