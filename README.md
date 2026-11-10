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

## Verificações (as mesmas do CI)

```bash
docker compose exec app sh -c "npm run format:check && npm run lint && npm run typecheck && npm run arch && npm run test:cov && npm run test:e2e && npm run build"
```

| Script              | O que verifica                                                   |
| ------------------- | ---------------------------------------------------------------- |
| `npm run lint`      | oxlint, incluindo as regras de Object Calisthenics (ADR 0010)    |
| `npm run typecheck` | Tipos do TypeScript                                              |
| `npm run arch`      | Regras de dependência entre camadas e contextos (ADR 0002)       |
| `npm run test:cov`  | Testes de unidade, com cobertura mínima de 90% e 100% no domínio |
| `npm run test:e2e`  | Testes ponta a ponta da API                                      |

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
    infrastructure/  NestJS, banco de dados, HTTP
katas/         exercícios do curso, fora do build
```

## Documentação

- [Decisões de arquitetura (ADRs)](docs/adr/README.md)
- [Glossário: linguagem ubíqua](docs/glossary.md)
- [Códigos de erro da API](docs/error-codes.md)
