# 0008. Deploy por imagem de container

- **Status:** aceita
- **Data:** 2026-11-09

## Contexto

Plataformas de hospedagem mudam de regras e de planos gratuitos com frequência. Amarrar o deploy a comandos específicos de uma plataforma torna o processo frágil.

## Decisão

Vamos empacotar a aplicação numa imagem Docker de produção (multi-stage), publicada no GitHub Container Registry pelo pipeline de CD a cada merge na `main`. A plataforma de hospedagem (Render, no curso) apenas executa essa imagem.

## Consequências

- O mesmo artefato roda localmente, no CI e em produção.
- Trocar de plataforma não exige mudar o build.
