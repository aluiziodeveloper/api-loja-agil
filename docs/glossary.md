# Glossário: linguagem ubíqua da Loja Ágil

Termos usados nas conversas com o negócio (português) e o nome correspondente no código (inglês).
Se um termo não está aqui, ele ainda não faz parte do domínio: discuta antes de criar código com ele.

## Identidade & Acesso (`identity`)

| Termo do negócio   | Código                                       | Definição                                               |
| ------------------ | -------------------------------------------- | ------------------------------------------------------- |
| Usuário            | `User`                                       | Pessoa com acesso à API, identificada por e-mail        |
| Cliente            | `Role.CUSTOMER`                              | Usuário que compra; vê apenas os próprios pedidos       |
| Operador           | `Role.OPERATOR`                              | Funcionário que administra catálogo e estoque           |
| Nome               | `Name`                                       | Nome de exibição, de 2 a 100 caracteres                 |
| E-mail             | `Email`                                      | Endereço único, normalizado em minúsculas               |
| Senha              | `Password` / `PasswordHash`                  | Segredo com regras mínimas; armazenado apenas como hash |
| Cadastrar-se       | `SignUpUseCase`                              | Cria um cliente; o e-mail não pode estar em uso         |
| Entrar             | `SignInUseCase`                              | Confere e-mail e senha; erro único para qualquer falha  |
| Usuário cadastrado | `UserRegistered`                             | Evento registrado quando um usuário é criado            |
| Perfil             | `GetProfileUseCase` / `UpdateProfileUseCase` | Dados do próprio usuário: nome e e-mail                 |
| Trocar a senha     | `ChangePasswordUseCase`                      | Exige a senha atual; a nova segue as regras mínimas     |
| Excluir a conta    | `DeleteAccountUseCase`                       | Remove o próprio usuário                                |
| Listar usuários    | `ListUsersUseCase`                           | Lista todos os usuários por nome; só para operadores    |

## Catálogo (`catalog`)

| Termo do negócio      | Código                                                | Definição                                                           |
| --------------------- | ----------------------------------------------------- | ------------------------------------------------------------------- |
| Produto               | `Product`                                             | Item vendável do catálogo; o SKU não muda depois de criado          |
| SKU                   | `Sku` (Shared Kernel)                                 | Código único do produto, `ABC123[-VAR]` (ex.: `CAM123-AZUL`)        |
| Nome do produto       | `ProductName`                                         | Nome de exibição, de 2 a 120 caracteres                             |
| Preço                 | `Money` (Shared Kernel)                               | Valor em centavos de real; inteiro e nunca negativo                 |
| Produto ativo/inativo | `Product.activate()` / `Product.deactivate()`         | Só produtos ativos aparecem para clientes e podem ser pedidos       |
| Cadastrar produto     | `CreateProductUseCase`                                | Cria um produto ativo; o SKU não pode estar em uso                  |
| Consultar produto     | `GetProductUseCase`                                   | Dados de um produto, ativo ou não                                   |
| Alterar produto       | `UpdateProductUseCase`                                | Muda nome e/ou preço                                                |
| Ativar / inativar     | `ActivateProductUseCase` / `DeactivateProductUseCase` | Liga ou desliga a venda do produto                                  |
| Buscar produtos       | `SearchProductsUseCase`                               | Filtro por nome ou SKU, ordenação e paginação; só ativos por padrão |
| Parâmetros de busca   | `SearchParams` (Shared Kernel)                        | Página, itens por página (1 a 100), ordenação e filtro validados    |
| Página de resultados  | `SearchResult` (Shared Kernel)                        | Itens da página, total e última página                              |

## Estoque (`inventory`)

| Termo do negócio        | Código                                       | Definição                                                                  |
| ----------------------- | -------------------------------------------- | -------------------------------------------------------------------------- |
| Item de estoque         | `StockItem`                                  | Saldo de um SKU no depósito; um por SKU                                    |
| Quantidade de estoque   | `StockQuantity`                              | Unidades inteiras, nunca negativas                                         |
| Nível de estoque        | `StockLevel`                                 | Físico e reservado; garante que o reservado nunca passa do físico (RN07)   |
| Estoque físico          | `onHand`                                     | Quantidade que existe no depósito                                          |
| Reserva                 | `reserve()` / `reserved`                     | Quantidade separada para pedidos confirmados e ainda não pagos             |
| Liberação               | `release()`                                  | Devolve ao disponível uma quantidade reservada (pedido cancelado)          |
| Disponível              | `available()`                                | `onHand − reserved`; o que ainda pode ser vendido                          |
| Baixa                   | `commit()`                                   | Saída definitiva do estoque quando o pedido é pago                         |
| Entrada                 | `receive()` / `ReceiveStockUseCase`          | Chegada de mercadoria; a primeira entrada de um SKU cria o item            |
| Ajuste de inventário    | `adjust()` / `AdjustStockUseCase`            | Substitui o físico pela contagem; exige motivo (`AdjustmentReason`)        |
| Movimentação            | `StockMovement`                              | Registro imutável de cada mudança: tipo, variações, motivo e horário       |
| Estoque mínimo          | `minimumLevel` / `ChangeMinimumLevelUseCase` | Abaixo dele a loja é alertada                                              |
| Alerta de estoque baixo | `LowStockDetected`                           | Evento registrado quando uma movimentação faz o disponível cruzar o mínimo |
| Consultar estoque       | `GetStockLevelUseCase`                       | Físico, reservado, disponível, mínimo e se está abaixo dele                |
| Histórico               | `ListStockMovementsUseCase`                  | Movimentações de um SKU, paginadas, em ordem cronológica                   |

## Pedidos (`ordering`)

| Termo do negócio          | Código                            | Definição                                                                 |
| ------------------------- | --------------------------------- | ------------------------------------------------------------------------- |
| Pedido                    | `Order`                           | Intenção de compra de um cliente; agregado que cuida do ciclo de vida     |
| Cesta                     | `Basket`                          | Itens, cupom e valores do pedido                                          |
| Item do pedido            | `OrderItem`                       | SKU, preço congelado na inclusão (RN10) e quantidade                      |
| Quantidade                | `Quantity`                        | De 1 a 100 unidades por item (RN09)                                       |
| Itens do pedido           | `OrderItems`                      | Até 20 SKUs distintos; o mesmo SKU agrupa as quantidades (RN09)           |
| Rascunho                  | `OrderStatus.DRAFT`               | Pedido ainda editável: itens e cupom só mudam aqui                        |
| Confirmar pedido          | `place()` / `PlaceOrderUseCase`   | Fecha o pedido e anuncia `OrderPlaced` para a reserva de estoque          |
| Pagar                     | `pay()` / `PayOrderUseCase`       | Pagamento aprovado (simulado); anuncia `OrderPaid` para a baixa           |
| Enviar                    | `ship()` / `ShipOrderUseCase`     | Pedido despachado; não pode mais ser cancelado                            |
| Cancelar                  | `cancel()` / `CancelOrderUseCase` | Encerra o pedido; `OrderCancelled` diz o estado anterior                  |
| Ciclo de vida             | `ensureTransition`                | `DRAFT → PLACED → PAID → SHIPPED`; cancelar até antes do envio (RN11)     |
| Cupom                     | `Coupon`                          | Desconto com código, valor mínimo do pedido e validade; um por pedido     |
| Código do cupom           | `CouponCode`                      | De 4 a 20 letras ou números, sem diferença de maiúsculas                  |
| Política de desconto      | `DiscountPolicy`                  | Strategy: `PercentageDiscount` (com teto, RN14) ou `FixedAmountDiscount`  |
| Regra de elegibilidade    | `Specification` / `allOf`         | `MinimumOrderValue` e `ValidUntil`: o cupom vale para este pedido?        |
| Subtotal, desconto, total | `prices()`                        | Soma dos itens, desconto do cupom (zero se deixou de valer) e a diferença |
| Catálogo de produtos      | `ProductCatalog`                  | Porta para o Catálogo: preço e se o produto está ativo (RN06)             |
| Meus pedidos              | `ListCustomerOrdersUseCase`       | Pedidos de um cliente, paginados, os mais recentes primeiro               |
