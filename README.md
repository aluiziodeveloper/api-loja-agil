# API Loja Ágil

API de pedidos e estoque construída no curso **NestJS Avançado: DDD, Clean Architecture e TDD**.
Cada aula prática corresponde a um pull request e a uma tag `aula-MM-NN`.

## Como rodar

Pré-requisitos: Docker e Docker Compose.

```bash
cp .env.example .env
docker compose up -d
docker compose exec app npm run start:dev
```

## Banco de dados

PostgreSQL 18 no serviço `db` do Compose, com dois bancos: `loja_agil` e `loja_agil_test`. O schema fica em `prisma/schema/`, um arquivo por contexto (ADR 0012).

```bash
docker compose exec app npm run db:migrate   # cria e aplica migrations
docker compose exec app npm run db:generate  # regenera o client em src/generated
```

Os bancos usam a collation ICU `pt-BR`, definida na criação do volume. Se o seu volume é anterior a ela, recrie-o com `docker compose down -v`.

## Verificações (as mesmas do CI)

```bash
docker compose exec app sh -c "npm run format:check && npm run lint && npm run typecheck && npm run arch && npm run test:cov && npm run test:int && npm run test:e2e && npm run build"
```

| Script                  | O que verifica                                                                                                                                                               |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run lint`          | oxlint, incluindo as regras de Object Calisthenics (ADR 0010)                                                                                                                |
| `npm run typecheck`     | Tipos do TypeScript                                                                                                                                                          |
| `npm run arch`          | Regras de dependência entre camadas e contextos (ADR 0002)                                                                                                                   |
| `npm run test:cov`      | Testes de unidade, com cobertura mínima de 90% e 100% no domínio e na aplicação                                                                                              |
| `npm run test:int`      | Testes de integração, contra o banco de testes                                                                                                                               |
| `npm run test:e2e`      | Testes ponta a ponta da API, pelo HTTP, em paralelo, com um banco de testes por worker                                                                                       |
| `npm run test:mutation` | Teste de mutação (Stryker) do domínio e dos casos de uso, com relatório em `reports/mutation/`; no CI, toda segunda e sob demanda (workflow Mutation); exige 100% (ADR 0017) |
| `npm run db:seed`       | Loja de demonstração no banco de desenvolvimento (rode `npm run build` antes); pode rodar de novo                                                                            |

## API

Com a aplicação no ar, a documentação interativa fica em <http://localhost:3000/docs>, e o documento OpenAPI, em <http://localhost:3000/docs-json> (ADR 0016). Ele sai dos mesmos schemas Zod que validam as requisições e filtram as respostas, e os testes end-to-end conferem cada resposta contra ele.

Toda resposta de sucesso vem em `{ "data" }` (uma página, em `{ "data", "meta" }`), e toda falha em `{ "error": { "code", "message" } }` (ADR 0013). Os códigos e seus status estão em [docs/error-codes.md](docs/error-codes.md).

| Contexto   | Rotas                                                                                                                                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Identidade | `POST /users`, `POST /auth/sign-in`, `GET`/`PATCH`/`DELETE /me`, `PUT /me/password`, `GET /users`, `GET /users/:id`, `POST /operators`                                                                                   |
| Catálogo   | `POST /products`, `GET /products`, `GET /products/:id`, `PATCH /products/:id`, `POST /products/:id/activate`, `POST /products/:id/deactivate`                                                                            |
| Estoque    | `GET /stock/:sku`, `POST /stock/:sku/receipts`, `POST /stock/:sku/adjustments`, `PUT /stock/:sku/minimum-level`, `GET /stock/:sku/movements`                                                                             |
| Pedidos    | `POST /orders`, `GET /orders`, `GET /orders/:id`, `POST /orders/:id/items`, `DELETE /orders/:id/items/:sku`, `PUT /orders/:id/coupon`, `DELETE /orders/:id/coupon`, `POST /orders/:id/place`, `/pay`, `/ship`, `/cancel` |
| Cupons     | `POST /coupons`                                                                                                                                                                                                          |
| Saúde      | `GET /health` (o processo está vivo), `GET /health/ready` (pronta para tráfego: o banco responde; senão, 503 `NOT_READY`)                                                                                                |

Para explorar a API em desenvolvimento, `npm run db:seed` cria a operadora `olga@loja.dev`, os clientes `ana@loja.dev` e `bruno@loja.dev` (senha `caneca123`), quatro produtos com estoque e o cupom `AGIL10`.

O primeiro operador é promovido no servidor, com `npm run build && npm run operator:promote -- <email>`; depois, um operador promove outro por `POST /operators`.

As buscas aceitam `page`, `perPage` (até 100) e `sortDirection`; a de produtos também `sort` (`name`, `price`, `sku`), `filter` e `includeInactive`, e a de usuários, `sort` (`name`, `email`) e `filter`. Toda rota exige `Authorization: Bearer <token>` (de `POST /auth/sign-in`), menos `GET /health`, `GET /health/ready`, `POST /users`, `POST /auth/sign-in`, `GET /products` e `GET /products/:id`. Gestão de usuários, produtos, estoque, cupons e o despacho de pedidos são só do perfil `OPERATOR` (RN03).

## Logs

Uma linha JSON por evento, na saída padrão, com o nível em `LOG_LEVEL` (`info` por padrão; `fatal`, `error`, `warn`, `debug`, `trace` ou `silent`). Cada requisição gera uma linha `request completed` com o `reqId`, que também volta no header `x-request-id` da resposta (um `x-request-id` recebido do proxy é reaproveitado). Status 5xx sai como `error`, 4xx como `warn`; as sondas `/health` ficam de fora. Token, cookies e senhas aparecem como `[Redacted]`. Em desenvolvimento, as linhas saem legíveis (`pino-pretty`); nos testes, silenciosas (`LOG_LEVEL=info` mostra).

## Encerramento

No `SIGTERM` (ou `SIGINT`), a aplicação para de aceitar conexões, termina as requisições em andamento (as respostas que ainda saem levam `Connection: close`, para o keep-alive não segurar o encerramento), desconecta o banco e sai com código 0. O log registra o sinal recebido e o fim.

## Estrutura

```text
src/
  shared/      Shared Kernel: classes base do domínio e da aplicação
  identity/    Identidade & Acesso
  catalog/     Catálogo
  inventory/   Estoque
  ordering/    Pedidos
    domain/          entidades, value objects, eventos (TypeScript puro)
    application/     casos de uso e portas
    infrastructure/  banco de dados (persistence) e HTTP (controllers, presenters)
    <contexto>.module.ts  composição do contexto no NestJS
  integration/ liga os contextos: adaptadores e inscrições nos eventos (ADR 0011)
  generated/   client do Prisma, gerado (fora do Git)
prisma/        schema por co
```
