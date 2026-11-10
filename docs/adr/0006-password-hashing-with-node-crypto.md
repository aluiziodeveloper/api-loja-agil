# 0006. Hash de senhas com `node:crypto` (scrypt)

- **Status:** aceita
- **Data:** 2026-11-09

## Contexto

Senhas nunca podem ser armazenadas em texto. bcrypt é a escolha tradicional, mas adiciona uma dependência. O Node já traz `scrypt`, um algoritmo de derivação de chave resistente a força bruta, e `timingSafeEqual` para comparação segura.

## Decisão

Vamos gerar hashes com `crypto.scrypt` (salt aleatório de 16 bytes por senha) e comparar com `crypto.timingSafeEqual`. A implementação fica na infraestrutura, atrás da porta `PasswordHasher` definida na aplicação.

## Consequências

- Nenhuma dependência externa nem binário nativo para instalar.
- Trocar de algoritmo (ex.: Argon2) exige só uma nova implementação de `PasswordHasher`.
