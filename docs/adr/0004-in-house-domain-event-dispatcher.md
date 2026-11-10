# 0004. Dispatcher de eventos de domínio próprio

- **Status:** aceita
- **Data:** 2026-11-09

## Contexto

Pedidos e Estoque se integram por eventos de domínio (`OrderPlaced`, `StockReserved`…). Poderíamos usar `@nestjs/cqrs` ou `@nestjs/event-emitter`, mas isso traria dependências de framework para perto do domínio e esconderia o mecanismo que queremos ensinar.

## Decisão

Vamos implementar um dispatcher simples na camada de aplicação (cerca de 30 linhas): os agregados registram eventos, os casos de uso os coletam após persistir e o dispatcher os entrega aos handlers registrados.

## Consequências

- O domínio continua livre de framework e o fluxo de eventos fica explícito e testável.
- Recursos avançados (retentativas, outbox, processamento assíncrono) não vêm prontos; se necessários, serão objeto de um novo ADR.
