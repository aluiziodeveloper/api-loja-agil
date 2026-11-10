# Códigos de erro da API

Cada erro de domínio tem um `code` estável (ADR 0003). Clientes da API devem decidir pelo `code`, nunca pela mensagem, que pode mudar.
O status HTTP é definido na infraestrutura (módulo 11); a coluna abaixo é a proposta atual.

## Shared Kernel

| Código                  | Classe                     | Quando acontece                                          | HTTP |
| ----------------------- | -------------------------- | -------------------------------------------------------- | ---- |
| `INVALID_ID`            | `InvalidIdError`           | Identificador fora do formato UUID                       | 400  |
| `INVALID_MONEY`         | `InvalidMoneyError`        | Valor negativo ou fora de centavos inteiros              | 400  |
| `INVALID_SEARCH_PARAMS` | `InvalidSearchParamsError` | Página, itens por página, ordenação ou direção inválidos | 400  |
| `INVALID_SKU`           | `InvalidSkuError`          | SKU fora do formato `ABC123[-VAR]`                       | 400  |

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

| Código                      | Classe                         | Quando acontece                                       | HTTP |
| --------------------------- | ------------------------------ | ----------------------------------------------------- | ---- |
| `INVALID_STOCK_QUANTITY`    | `InvalidStockQuantityError`    | Quantidade negativa ou fracionada                     | 400  |
| `EMPTY_STOCK_MOVEMENT`      | `EmptyStockMovementError`      | Entrada, reserva, liberação ou baixa de zero unidades | 400  |
| `MISSING_ADJUSTMENT_REASON` | `MissingAdjustmentReasonError` | Ajuste de inventário sem motivo                       | 400  |
| `STOCK_BELOW_RESERVED`      | `StockBelowReservedError`      | Contagem menor que a quantidade reservada             | 409  |
| `INSUFFICIENT_STOCK`        | `InsufficientStockError`       | Reserva maior que o disponível                        | 409  |
| `RESERVED_STOCK_EXCEEDED`   | `ReservedStockExceededError`   | Liberação ou baixa maior que o reservado              | 409  |
| `STOCK_ITEM_NOT_FOUND`      | `StockItemNotFoundError`       | SKU sem estoque registrado                            | 404  |

Ao criar um erro de domínio, acrescente uma linha aqui no mesmo pull request.
