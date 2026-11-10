# 0010. Object Calisthenics como diretriz de design

- **Status:** aceita
- **Data:** 2026-11-10

## Contexto

O domínio da Loja Ágil vai crescer com regras de preço, estoque e pedidos. Sem critérios objetivos, métodos longos, tipos primitivos e entidades anêmicas tendem a se acumular. As nove regras do Object Calisthenics (Jeff Bay, _The ThoughtWorks Anthology_) dão esses critérios, mas aplicadas ao pé da letra em todo o código atrapalham mais do que ajudam, principalmente nas bordas (DTOs, controllers, mapeadores).

## Decisão

Vamos adotar as nove regras como **diretriz** para o código de domínio e de aplicação, verificando automaticamente as que uma ferramenta consegue medir e revisando as demais no pull request.

| Regra                                    | Como verificamos                                                                                  |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 1. Um nível de indentação por método     | oxlint `max-depth: 1`                                                                             |
| 2. Não use `else`                        | oxlint `no-else-return` + revisão                                                                 |
| 3. Encapsule tipos primitivos            | revisão: valores com regras viram value objects                                                   |
| 4. Coleções de primeira classe           | revisão                                                                                           |
| 5. Um ponto por linha                    | revisão: vale para objetos, não para estruturas de dados                                          |
| 6. Não abrevie                           | oxlint `id-length` + revisão                                                                      |
| 7. Mantenha as entidades pequenas        | oxlint `max-lines-per-function: 15`, `max-lines: 100`, `max-params: 3`, `max-classes-per-file: 1` |
| 8. No máximo duas variáveis de instância | revisão: diretriz para o domínio, não para módulos e controllers do NestJS                        |
| 9. Sem getters e setters                 | revisão: _Tell, Don't Ask_; conversões na borda (`toCents()`, mapeadores) são permitidas          |

Os arquivos de teste ficam fora dos limites de tamanho (regra 7), porque um `describe` reúne muitos casos por natureza.

## Consequências

- O código de domínio fica com métodos curtos, nomes completos e regras perto dos dados.
- Algumas regras dependem de revisão humana; o template de pull request ganha uma lista de verificação de design.
- Quando uma regra atrapalhar a legibilidade em um caso específico, a exceção deve ser explicada no PR (ou com um comentário `oxlint-disable-next-line` justificado), e não silenciosamente.
