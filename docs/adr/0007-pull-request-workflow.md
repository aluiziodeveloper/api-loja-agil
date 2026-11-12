# 0007. Fluxo de trabalho com pull requests

- **Status:** aceita
- **Data:** 2026-11-09

## Contexto

Precisamos garantir que nada chegue à `main` sem revisão automatizada (lint, tipos, testes e build) e que o histórico seja legível.

## Decisão

Vamos trabalhar no GitHub Flow: cada mudança nasce numa branch (com o tipo do Conventional Commits: `feat/…`, `fix/…`, `test/…`, `refactor/…`, `docs/…`, `ci/…`, `build/…`, `chore/…`), vira um pull request e só entra na `main` por squash merge com o CI verde. O título do PR segue Conventional Commits em inglês e é validado no CI, porque ele se torna a mensagem do commit na `main`. A `main` é protegida por um ruleset (`.github/ruleset-main.json`). Cada aula prática do curso corresponde a um PR.

## Consequências

- A `main` está sempre verde e com um commit por mudança.
- Rulesets em repositórios privados exigem GitHub Pro; repositórios públicos têm o recurso gratuitamente.
