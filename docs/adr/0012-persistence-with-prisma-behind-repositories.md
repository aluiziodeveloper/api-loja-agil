# 0012. Persistência com Prisma, atrás das portas de repositório

- **Status:** aceita
- **Data:** 2026-11-11

## Contexto

Até o módulo 9, os repositórios eram fakes em memória. A aplicação precisa de um banco de verdade, e o domínio e os casos de uso não podem mudar por causa disso (ADR 0002): as portas `UserRepository`, `ProductRepository`, `StockItemRepository`, `CouponRepository`, `OrderRepository` e `Transaction` já dizem o que a aplicação precisa.

Três perguntas ficam em aberto: como garantir que o repositório real se comporta como o fake; como a transação chega aos repositórios sem aparecer nos casos de uso; e o que fazer quando duas operações mudam o mesmo estoque ao mesmo tempo.

## Decisão

- **PostgreSQL 18 e Prisma 7**, com o driver adapter `@prisma/adapter-pg`, um schema por contexto em `prisma/schema/` e migrations versionadas. O banco usa a collation ICU `pt-BR`, para ordenar nomes com acento como um leitor brasileiro espera.
- **Os repositórios Prisma moram em `infrastructure/persistence/` de cada contexto** e traduzem linhas em snapshots e snapshots em linhas. O domínio não conhece o Prisma; o client gerado fica em `src/generated/`, fora do Git.
- **Um teste de contrato por porta** (`*-repository.contract.ts`). O fake e o repositório Prisma rodam os mesmos testes; o do Prisma, contra o banco `loja_agil_test` (`npm run test:int`, job "Integration" no CI).
- **A transação no `AsyncLocalStorage`.** `PrismaDatabase.run` abre uma transação interativa e guarda o client dela; `client()` o entrega a quem pedir. Os casos de uso continuam usando só a porta `Transaction`; uma transação dentro de outra entra na de fora.
- **Travamento otimista no estoque.** A tabela `stock_items` tem `version`; o repositório lembra a versão que cada instância carregou (num `WeakMap`, fora do domínio) e grava só se ela ainda for a do banco. Senão, `ConcurrentUpdateError` (`CONCURRENT_UPDATE`, 409).
- **Cópias em JSONB.** O desconto do cupom e a cópia do cupom aplicado ao pedido (D19) são gravados como o snapshot, em JSONB; o que se consulta (código, validade, cliente, data) vira coluna.

## Consequências

- Trocar o fake pelo banco é trocar uma linha na composição; os testes de unidade continuam rápidos e sem banco.
- Uma diferença entre o fake e o banco vira um teste que falha, e não um bug em produção. Foi assim que a ordenação com acento apareceu.
- O teste de integração precisa do Postgres: localmente, pelo Docker Compose; no CI, por um service container.
- Com o travamento otimista, quem perde a corrida recebe um erro e precisa tentar de novo. Para o estoque, que muda pouco por item, é mais barato do que travar a linha em toda leitura.
- Só o estoque tem versão. Os pedidos mudam por um cliente de cada vez; se isso deixar de valer, eles ganham versão num novo ADR.
