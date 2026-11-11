# 0011. Integração síncrona entre contextos, na mesma transação

- **Status:** aceita
- **Data:** 2026-11-10

## Contexto

Confirmar um pedido precisa reservar o estoque de todos os itens ou de nenhum (RN12); pagar dá baixa e cancelar devolve (RN13). Pedidos e Estoque são contextos separados, que não importam o código um do outro (ADR 0002) e conversam por eventos (ADR 0004).

Há dois caminhos:

1. **Síncrono, na mesma transação.** O caso de uso de Pedidos grava o pedido e publica os eventos; os handlers do Estoque rodam na hora, dentro da mesma transação. Se um falhar, nada fica gravado.
2. **Assíncrono, com consistência eventual.** O pedido é gravado junto com o evento numa tabela de saída (outbox); o Estoque processa depois e responde com outro evento (`StockReserved` ou `StockReservationFailed`); o pedido é confirmado ou cancelado conforme a resposta.

## Decisão

Vamos usar o caminho síncrono enquanto a aplicação for um monólito modular com um banco só.

- As transições do pedido rodam dentro da porta `Transaction` (`transitionOrder`); o `EventDispatcher` entrega os eventos aos handlers um de cada vez, e o primeiro erro desfaz tudo e chega ao cliente.
- O Estoque lê os eventos de Pedidos pelos seus próprios tipos (`OrderLinesMessage`), com só os campos que usa. O contrato é o nome do evento e esses campos, verificado pelo teste do fluxo completo em `src/integration/`.
- A ligação entre contextos (inscrições e adaptadores) mora em `src/integration/`, que conhece os contextos e não é conhecida por nenhum deles.

## Consequências

- A consistência é imediata: o cliente recebe `STOCK_SHORTAGE` no momento em que confirma, e o pedido continua em rascunho.
- Não há tabela de saída, fila nem compensação para manter.
- Os contextos ficam acoplados no tempo: um handler lento deixa a confirmação lenta, e uma falha no Estoque impede a confirmação.
- A transação abrange agregados de dois contextos, contrariando de propósito a regra de "um agregado por transação". A troca é consciente: um banco só, e uma regra de negócio (RN12) que pede atomicidade.
- Se um contexto virar um serviço separado, ou se um handler depender de algo externo (e-mail, pagamento), a integração passa ao caminho assíncrono, com outbox (aula 09-08), num novo ADR.
