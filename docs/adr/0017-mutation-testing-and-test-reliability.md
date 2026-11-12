# 0017. Teste de mutação e testes confiáveis

- **Status:** aceita
- **Data:** 2026-11-12

## Contexto

Ao fim do módulo 14, as três suítes tinham 100% de cobertura. A cobertura diz que cada linha rodou durante os testes, não que algum teste confere o que ela faz. A primeira execução do Stryker sobre o domínio e os casos de uso matou 1004 mutantes e deixou 24 vivos, quase todos na borda de dentro das regras: os testes recusavam um e-mail de 255 caracteres, mas nenhum aceitava um de 254. Na mesma época, um teste do `UniqueId` falhou uma vez no meio da suíte e passou nas dez execuções seguintes.

## Decisão

- **Mutação no domínio e na aplicação**, com o Stryker e o runner do Vitest (`stryker.config.mjs`, `npm run test:mutation`). As portas ficam de fora: são só contratos. A infraestrutura também fica: ela é provada pelos testes de integração e pelos e2e, e não pelos de unidade.
- **O checker do TypeScript descarta o mutante que não compila.** Uma string vazia no lugar de um campo tipado, ou um estado inventado na tabela de transições, o compilador já recusaria; esses mutantes não entram no score.
- **Score de 100%, com `break: 100`.** Cada mutante que sobrevive vira um teste novo ou um `// Stryker disable next-line <mutador>: <motivo>`, e o motivo é revisado no PR. Hoje são dois, nas buscas em que o cliente não escolhe a ordenação.
- **No CI, toda segunda e sob demanda** (workflow "Mutation", com o relatório como artefato). Não roda em todo PR, porque leva de 7 a 11 minutos para uma medida que muda devagar. Num PR, quem revisa pode rodar só os arquivos alterados (`npx stryker run --mutate <arquivos>`).
- **Cobertura mínima de 100% também na aplicação**, além do domínio. Um mutante sem cobertura nem chega a ser testado.
- **Teste intermitente se corrige, não se repete.** Nada de `retry`. Reproduz-se a falha sob carga, acha-se a causa e o teste passa a esperar a condição de que precisa (no `UniqueId`, o relógio mudar de milissegundo) em vez de um tempo fixo.
- **A revisão de PR olha o que os checks não olham:** fake e banco diferindo num caso que o contrato não cobre, teste que passaria sem o código, porta com método que só os testes usam, contrato da API que muda sem aviso.

## Consequências

- Os testes novos acompanham as bordas das regras dos dois lados (254 e 255, 128 e 129, 1 e 100). Um teste que monta o resultado esperado com o próprio código testado (`new EmailAlreadyInUseError(...)`) não pega a mudança desse código; a expectativa passa a ser o texto literal.
- Um PR pode deixar um mutante vivo que só aparece na segunda-feira seguinte. Corrige-se então, como qualquer falha do CI.
- O Stryker roda com o código copiado para `.stryker-tmp/` e não toca no banco; os repositórios Prisma continuam medidos pela integração.
- O relatório HTML fica em `reports/mutation/`, fora do Git.
