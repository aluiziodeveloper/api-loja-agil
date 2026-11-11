# Códigos de erro da API

Cada erro de domínio tem um `code` estável (ADR 0003). Clientes da API devem decidir pelo `code`, nunca pela mensagem, que pode mudar.
O status HTTP é definido na infraestrutura: cada contexto declara o seu mapa (`<contexto>/infrastructure/http/*-error-status.ts`), e o teste `src/app-error-status.spec.ts` confere que ele é igual a esta tabela.

Toda resposta de erro tem o formato `{ "error": { "code": "...", "message": "..." } }`.

## Shared Kernel

| Código                  | Classe                     | Quando acontece                                                                             | HTTP |
| ----------------------- | -------------------------- | ------------------------------------------------------------------------------------------- | ---- |
| `INVALID_ID`            | `InvalidIdError`           | Identificador fora do formato UUID                                                          | 400  |
| `INVALID_MONEY`         | `InvalidMoneyError`        | Valor negativo ou fora de centavos inteiros                                                 | 400  |
| `INVALID_SEARCH_PARAMS` | `InvalidSearchParamsError` | Página, itens por página, ordenação ou direção inválidos                                    | 400  |
| `INVALID_SKU`           | `InvalidSkuError`          | SKU fora do formato `ABC123[-VAR]`                                                          | 400  |
| `CONCURRENT_UPDATE`     | `ConcurrentUpdateError`    | Outra operação gravou o mesmo registro depois que ele foi carregado; tentar de novo resolve | 409  |

## Identidade & Acesso

| Código                       | Classe                          | Quando acontece                                      | HTTP |
| ---------------------------- | ------------------------------- | ---------------------------------------------------- | ---- |
| `INVALID_EMAIL`              | `InvalidEmailError`             | E-mail malformado ou com mais de 254 caracteres      | 400  |
| `INVALID_NAME`               | `InvalidNameError`              | Nome fora de 2 a 100 caracteres                      | 400  |
| `WEAK_PASSWORD`              | `WeakPasswordError`             | Senha fora de 8 a 128 caracteres ou sem letra/número | 400  |
| `INVALID_PASSWORD_HASH`      | `InvalidPasswordHashError`      | Hash vazio (erro interno de infraestrutura)          | 500  |
| `INVALID_ROLE`               | `InvalidRoleError`              | Perfil desconhecido                                  | 400  |
| `EMAIL_ALREADY_IN_USE`       | `EmailAlreadyInUseError`        | Cadastro ou alteração para um e-mail já usado        | 409  |
| `INVALID_CREDENTIALS`        | `InvalidCredentialsError`       | Login com e-mail ou senha errados (resposta única)   | 401  |
| `USER_NOT_FOUND`             | `UserNotFoundError`             | Usuário inexistente                                  | 404  |
| `INCORRECT_CURRENT_PASSWORD` | `IncorrectCurrentPasswordError` | Troca de senha com a senha atual errada              | 422  |

## Catálogo

| Código                 | Classe                    | Quando acontece                            | HTTP |
| ---------------------- | ------------------------- | ------------------------------------------ | ---- |
| `INVALID_PRODUCT_NAME` | `InvalidProductNameError` | Nome de produto fora de 2 a 120 caracteres | 400  |
| `SKU_ALREADY_IN_USE`   | `SkuAlreadyInUseError`    | Cadastro de produto com um SKU já usado    | 409  |
| `PRODUCT_NOT_FOUND`    | `ProductNotFoundError`    | Produto inexistente                        | 404  |

## Estoque

| Código                      | Classe                         | Quando acontece                                                       | HTTP |
| --------------------------- | ------------------------------ | --------------------------------------------------------------------- | ---- |
| `INVALID_STOCK_QUANTITY`    | `InvalidStockQuantityError`    | Quantidade negativa ou fracionada                                     | 400  |
| `EMPTY_STOCK_MOVEMENT`      | `EmptyStockMovementError`      | Entrada, reserva, liberação ou baixa de zero unidades                 | 400  |
| `MISSING_ADJUSTMENT_REASON` | `MissingAdjustmentReasonError` | Ajuste de inventário sem motivo                                       | 400  |
| `STOCK_BELOW_RESERVED`      | `StockBelowReservedError`      | Contagem menor que a quantidade reservada                             | 409  |
| `INSUFFICIENT_STOCK`        | `InsufficientStockError`       | Reserva maior que o disponível                                        | 409  |
| `RESERVED_STOCK_EXCEEDED`   | `ReservedStockExceededError`   | Liberação ou baixa maior que o reservado                              | 409  |
| `STOCK_ITEM_NOT_FOUND`      | `StockItemNotFoundError`       | SKU sem estoque registrado                                            | 404  |
| `STOCK_SHORTAGE`            | `StockShortageError`           | Pedido confirmado com itens além do disponível; lista todas as faltas | 422  |

## Pedidos

| Código                     | Classe                        | Quando acontece                                  | HTTP |
| -------------------------- | ----------------------------- | ------------------------------------------------ | ---- |
| `INVALID_QUANTITY`         | `InvalidQuantityError`        | Quantidade fora de 1 a 100, ou soma acima de 100 | 400  |
| `TOO_MANY_ORDER_ITEMS`     | `TooManyOrderItemsError`      | Mais de 20 SKUs distintos no pedido              | 422  |
| `ORDER_ITEM_NOT_FOUND`     | `OrderItemNotFoundError`      | Remoção de um SKU que não está no pedido         | 404  |
| `ORDER_NOT_EDITABLE`       | `OrderNotEditableError`       | Itens ou cupom alterados fora do rascunho        | 409  |
| `EMPTY_ORDER`              | `EmptyOrderError`             | Confirmação de um pedido sem itens               | 422  |
| `INVALID_ORDER_TRANSITION` | `InvalidOrderTransitionError` | Mudança de estado fora do ciclo de vida          | 409  |
| `INVALID_COUPON_CODE`      | `InvalidCouponCodeError`      | Código fora do formato                           | 400  |
| `INVALID_DISCOUNT`         | `InvalidDiscountError`        | Percentual fora de 1 a 100, ou valor fixo zero   | 400  |
| `COUPON_NOT_APPLICABLE`    | `CouponNotApplicableError`    | Pedido abaixo do mínimo, ou cupom vencido        | 422  |
| `COUPON_ALREADY_APPLIED`   | `CouponAlreadyAppliedError`   | Segundo cupom no mesmo pedido                    | 409  |
| `ORDER_NOT_FOUND`          | `OrderNotFoundError`          | Pedido inexistente                               | 404  |
| `PRODUCT_UNAVAILABLE`      | `ProductUnavailableError`     | Produto inativo ou fora do catálogo              | 422  |
| `COUPON_NOT_FOUND`         | `CouponNotFoundError`         | Código de cupom inexistente                      | 404  |
| `COUPON_CODE_IN_USE`       | `CouponCodeInUseError`        | Cadastro de cupom com código repetido            | 409  |

## Borda HTTP

Erros que não vêm do domínio:

- `VALIDATION_FAILED` (400): a requisição não tem o formato esperado; `details` lista cada campo, com `path` e `message`.
- `UNAUTHORIZED` (401): rota protegida sem token, ou com um token que a API não emitiu, expirado ou adulterado. A mensagem não diz qual (ADR 0014).
- `FORBIDDEN` (403): o token é válido, mas o perfil não pode usar a rota (RN03).
- `INTERNAL_ERROR` (500): falha inesperada. A mensagem e a pilha vão para o log, nunca para o cliente.
- Os demais erros HTTP usam o nome do status como código, como `NOT_FOUND` para uma rota inexistente.

Ao criar um erro de domínio, acrescente uma linha aqui e no mapa do contexto, no mesmo pull request.
