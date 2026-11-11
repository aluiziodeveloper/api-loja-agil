# 0015. Estratégia dos testes end-to-end

- **Status:** aceita
- **Data:** 2026-11-11

## Contexto

Os testes end-to-end existem desde o módulo 11 e cobrem 100% dos controllers. Ao fim do módulo 12, eram 82 testes em 14 arquivos, com 65 chamadas a `app.inject` montadas à mão. Cada arquivo repetia a subida da aplicação, a limpeza do banco e o fechamento, e a busca de produtos gravava direto no repositório. Os arquivos rodavam um de cada vez, contra o mesmo banco dos testes de integração e no mesmo job do CI, que só guardava a cobertura da integração.

## Decisão

- **Um job "E2E" no CI**, com o próprio PostgreSQL e o próprio relatório de cobertura (`coverage/e2e`). Uma falha da integração não esconde mais o resultado dos e2e.
- **Quem faz, não como.** O `TestClient` (`test/setup/test-client.ts`) faz as requisições como um usuário: `ana.post('/orders')`. `app.inject` fica só nos testes que tratam do header cru.
- **`useTestApp()` por arquivo** (`test/setup/e2e.ts`): sobe a aplicação, zera o banco antes de cada teste e fecha no fim. Os clientes são declarados no topo do `describe` (`e2e.as(customer(ANA))`) e só procuram a aplicação na hora da requisição.
- **Dados pela porta da frente.** `givenProduct`, `givenDraft` e `givenUser` (`test/setup/scenarios.ts`) montam os cenários pela API. Nenhum e2e grava direto num repositório.
- **Uma jornada de compra** (`test/purchase-journey.e2e-spec.ts`), do cadastro ao despacho, conferindo o estoque no caminho. Os outros e2e provam cada rota; ela prova que as rotas se encaixam.
- **Em paralelo, um banco por worker** (`loja_agil_test_e2e_N`), criado e migrado pelo setup global. O número de workers é o de núcleos, até 4. A integração mantém o `loja_agil_test` e o seu próprio setup de migrations.
- **Seed pelos casos de uso.** `npm run db:seed` monta a loja de demonstração com as mesmas regras da API e pode rodar de novo sem duplicar nada.

## Consequências

- Um teste novo começa pelos dados que o usuário criaria, e não pelo esquema do banco. Só dois e2e olham o banco por dentro: o que confere a conexão e o que confere que a senha é gravada como hash.
- Os cenários pela API são mais lentos do que gravar no repositório, e um defeito na rota de cadastro quebra mais testes. Em troca, nenhum e2e monta um estado que a API não consegue produzir.
- A jornada é um teste longo, com várias asserções: quando falha, a mensagem diz o passo, mas não isola a causa. Para isso existem os e2e de cada rota.
- Mais workers não é sempre mais rápido: a suíte é dominada pela importação da aplicação, que disputa CPU. O número de workers acompanha o número de núcleos.
- Os bancos `loja_agil_test_e2e_N` ficam no PostgreSQL de desenvolvimento entre as execuções; o setup só aplica as migrations que faltam.
