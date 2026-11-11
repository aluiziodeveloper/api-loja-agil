# 0013. A camada HTTP no NestJS: um controller por caso de uso

- **Status:** aceita
- **Data:** 2026-11-11

## Contexto

Os casos de uso, os repositórios e a transação existem, mas nada os expõe: até o módulo 10, eles eram montados à mão, nos testes. A API precisa receber requisições, validar a entrada, chamar o caso de uso e responder num formato previsível, sem que o domínio e a aplicação passem a depender do NestJS (ADR 0002).

As regras de lint (ADR 0010) também pesam: um controller com seis casos de uso no construtor fere o limite de três parâmetros.

## Decisão

- **Um módulo Nest por contexto** (`<contexto>/<contexto>.module.ts`), que é a raiz de composição dele: cada porta recebe o seu adaptador e cada caso de uso é montado por uma factory (`provideUseCase`). Os casos de uso continuam sem decorators.
- **Portas como classes abstratas.** A interface some na compilação; a classe abstrata existe em runtime e serve de token de injeção. Os tokens de `provideUseCase` são conferidos pelo compilador, na ordem do construtor.
- **Um controller por caso de uso**, em `<contexto>/infrastructure/http/`, com `@Inject` explícito. Cada um traduz a requisição, chama o caso de uso e entrega a resposta ao presenter.
- **Zod na borda, regras no domínio.** O `ZodValidationPipe` confere só o formato (campos, tipos, conversão da query string) e responde `VALIDATION_FAILED` (400) com todos os problemas. Tamanhos, faixas e formatos de negócio continuam nos Value Objects.
- **Erros num formato só.** O `ErrorResponseFilter`, global, responde `{ "error": { "code", "message" } }`. Cada contexto declara o status dos seus códigos; a aplicação junta os mapas, e um teste os mantém iguais a `docs/error-codes.md`. Um erro inesperado responde `INTERNAL_ERROR` (500) e vai para o log, sem expor mensagem nem pilha.
- **Respostas em envelope.** O `EnvelopeInterceptor` responde `{ "data" }`, e uma página `{ "data", "meta" }`. Os presenters são schemas Zod de resposta: só os campos do contrato saem.
- **A integração entrega as portas entre contextos.** O `IntegrationModule`, global, fornece `ProductCatalog` e `EventPublisher` e liga o Estoque aos eventos de Pedidos na inicialização; nenhum contexto o importa.
- **Cliente provisório.** Até a autenticação (módulo 12), os pedidos identificam o cliente pelo header `x-customer-id`, lido pelo decorator `@CurrentCustomer()`.

## Consequências

- Muitos arquivos pequenos: um controller por rota. Em troca, cada um cabe numa tela e depende de um caso de uso só.
- Trocar uma implementação é trocar uma linha no módulo do contexto.
- Os controllers são cobertos pelos testes end-to-end (`npm run test:e2e`, com cobertura de 100%), que rodam contra o banco de testes no job "Integration" do CI.
- Um código de erro novo exige uma linha no mapa do contexto e na tabela de `docs/error-codes.md`; esquecer uma das duas quebra o teste.
- O header `x-customer-id` não prova nada: qualquer um pode se passar por qualquer cliente. É aceitável só até o módulo 12, que o troca pelo JWT sem mudar controllers nem casos de uso.
