# 0002. Arquitetura modular por bounded context

- **Status:** aceita
- **Data:** 2026-11-09

## Contexto

O sistema tem quatro áreas de negócio com regras e vocabulário próprios: Identidade & Acesso, Catálogo, Estoque e Pedidos. Uma organização por camada técnica global (`controllers/`, `services/`…) espalharia cada regra de negócio pelo projeto inteiro.

## Decisão

Vamos organizar `src/` por bounded context (`identity`, `catalog`, `inventory`, `ordering`) e, dentro de cada um, pelas camadas da Clean Architecture: `domain`, `application` e `infrastructure`. Blocos reutilizáveis ficam em `shared` (Shared Kernel). As dependências apontam sempre para dentro: `infrastructure → application → domain`. Um contexto não importa código interno de outro; a integração acontece por portas e eventos de domínio.

## Consequências

- Cada contexto pode evoluir (ou ser extraído) com pouco impacto nos demais.
- As regras de dependência são verificadas automaticamente pelo dependency-cruiser no CI (aula 02-05).
- Há mais pastas e alguns mapeamentos explícitos entre contextos, um custo aceito em troca do isolamento.
