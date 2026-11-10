# 0005. Imports relativos com sufixo `.js`

- **Status:** aceita
- **Data:** 2026-11-09

## Contexto

O projeto é ESM (`"type": "module"`) com `moduleResolution: nodenext`, o que exige a extensão `.js` nos imports relativos. Avaliamos aliases com subpath imports do Node (`#*`). Em 2026-11-09 eles funcionaram no `tsc`, no build e no runtime, mas falharam nos testes e2e: o Vitest carregou o mesmo arquivo por dois caminhos (_dual module hazard_), gerando duas classes `PrismaService` distintas e quebrando a injeção de dependências do Nest.

## Decisão

Vamos usar apenas imports relativos com sufixo `.js`, o padrão ESM oficial, sem aliases.

## Consequências

- Nenhuma configuração extra em TypeScript, Vitest, build ou runtime.
- Imports mais longos (`../../../shared/...`); o editor gera esses caminhos automaticamente.
- Reavaliar aliases quando o ecossistema resolver o problema de módulo duplicado.
