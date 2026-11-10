# 0003. Erros de domínio como exceções

- **Status:** aceita
- **Data:** 2026-11-09

## Contexto

Regras de negócio violadas (SKU inválido, pedido sem itens, estoque insuficiente) precisam chegar ao cliente da API como respostas HTTP claras, sem que o domínio conheça HTTP ou NestJS. As alternativas eram lançar exceções ou retornar `Result/Either` em todos os métodos.

## Decisão

Vamos lançar subclasses de `DomainError`, cada uma com um `code` estável (ex.: `INVALID_SKU`). Um exception filter global na infraestrutura traduz esses erros em respostas HTTP 4xx. `Result/Either` será apresentado em uma aula comparativa, mas não será adotado.

## Consequências

- O código de domínio fica direto e legível, sem encadeamento de `Result`.
- O tipo de retorno dos métodos não mostra os erros possíveis; compensamos com testes que documentam cada erro.
- O mapeamento de códigos de erro para status HTTP fica centralizado em um único lugar.
