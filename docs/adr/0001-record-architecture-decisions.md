# 0001. Registrar decisões de arquitetura

- **Status:** aceita
- **Data:** 2026-11-09

## Contexto

Decisões de arquitetura costumam viver na cabeça de quem as tomou ou em conversas perdidas. Meses depois, ninguém sabe por que o código é como é, e decisões boas são desfeitas por falta de contexto.

## Decisão

Vamos registrar cada decisão de arquitetura relevante como um ADR (Architecture Decision Record) em `docs/adr/`, numerado em sequência, no formato de Michael Nygard (contexto, decisão, consequências). ADRs são imutáveis: para mudar uma decisão, criamos um novo ADR que substitui o anterior.

## Consequências

- Novas pessoas entendem o histórico de decisões lendo poucos arquivos.
- Toda mudança de arquitetura passa a exigir um ADR no mesmo pull request.
