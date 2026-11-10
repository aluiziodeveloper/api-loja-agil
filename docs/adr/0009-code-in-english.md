# 0009. Código em inglês, comunicação em português

- **Status:** aceita
- **Data:** 2026-11-09

## Contexto

A equipe e o negócio falam português, mas o ecossistema (bibliotecas, frameworks, documentação, mercado) usa inglês. Misturar idiomas no código gera nomes inconsistentes.

## Decisão

Vamos escrever identificadores, nomes de arquivos, branches e mensagens de commit em inglês. Documentação, ADRs e mensagens destinadas ao usuário final ficam em português. O glossário (`docs/glossary.md`) mapeia cada termo do negócio para o nome usado no código.

## Consequências

- O código segue as convenções do ecossistema TypeScript/NestJS.
- O glossário precisa ser atualizado sempre que um termo de domínio for criado.
