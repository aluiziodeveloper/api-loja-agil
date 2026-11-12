# Glossário: linguagem ubíqua da Loja Ágil

Termos usados nas conversas com o negócio (português) e o nome correspondente no código (inglês).
Se um termo não está aqui, ele ainda não faz parte do domínio: discuta antes de criar código com ele.

## Identidade & Acesso (`identity`)

| Termo do negócio   | Código                                       | Definição                                                                     |
| ------------------ | -------------------------------------------- | ----------------------------------------------------------------------------- |
| Usuário            | `User`                                       | Pessoa com acesso à API, identificada por e-mail                              |
| Cliente            | `Role.CUSTOMER`                              | Usuário que compra; vê apenas os próprios pedidos                             |
| Operador           | `Role.OPERATOR`                              | Funcionário que administra catálogo e estoque                                 |
| Nome               | `Name`                                       | Nome de exibição, de 2 a 100 caracteres                                       |
| E-mail             | `Email`                                      | Endereço único, normalizado em minúsculas                                     |
| Senha              | `Password` / `PasswordHash`                  | Segredo com regras mínimas; armazenado apenas como hash                       |
| Cadastrar-se       | `SignUpUseCase`                              | Cria um cliente; o e-mail não pode estar em uso                               |
| Entrar             | `SignInUseCase`                              | Confere e-mail e senha; erro único para qualquer falha                        |
| Usuário cadastrado | `UserRegistered`                             | Evento registrado quando um usuário é criado                                  |
| Perfil             | `GetProfileUseCase` / `UpdateProfileUseCase` | Dados do próprio usuário: nome e e-mail                                       |
| Trocar a senha     | `ChangePasswordUseCase`                      | Exige a senha atual; a nova segue as regras mínimas                           |
| Excluir a conta    | `DeleteAccountUseCase`                       | Remove o próprio usuário                                                      |
| Listar usuários    | `ListUsersUseCase`                           | Busca usuários por nome ou e-mail, com ordenação e página; só para operadores |

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

| Termo do negócio        | Código                                       | Definição                                                                                            |
| ----------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Item de estoque         | `StockItem`                                  | Saldo de um SKU no depósito; um por SKU                                                              |
| Quantidade de estoque   | `StockQuantity`                              | Unidades inteiras, nunca negativas                                                                   |
| Nível de estoque        | `StockLevel`                                 | Físico e reservado; garante que o reservado nunca passa do físico (RN07)                             |
| Estoque físico          | `onHand`                                     | Quantidade que existe no depósito                                                                    |
| Reserva                 | `reserve()` / `reserved`                     | Quantidade separada para pedidos confirmados e ainda não pagos                                       |
| Liberação               | `release()`                                  | Devolve ao disponível uma quantidade reservada (pedido cancelado)                                    |
| Disponível              | `available()`                                | `onHand − reserved`; o que ainda pode ser vendido                                                    |
| Baixa                   | `commit()`                                   | Saída definitiva do estoque quando o pedido é pago                                                   |
| Entrada                 | `receive()` / `ReceiveStockUseCase`          | Chegada de mercadoria; a primeira entrada de um SKU cria o item                                      |
| Ajuste de inventário    | `adjust()` / `AdjustStockUseCase`            | Substitui o físico pela contagem; exige motivo (`AdjustmentReason`)                                  |
| Movimentação            | `StockMovement`                              | Registro imutável de cada mudança: tipo, variações, motivo e horário                                 |
| Estoque mínimo          | `minimumLevel` / `ChangeMinimumLevelUseCase` | Abaixo dele a loja é alertada                                                                        |
| Alerta de estoque baixo | `LowStockDetected`                           | Evento registrado quando uma movimentação faz o disponível cruzar o mínimo                           |
| Consultar estoque       | `GetStockLevelUseCase`                       | Físico, reservado, disponível, mínimo e se está abaixo dele                                          |
| Histórico               | `ListStockMovementsUseCase`                  | Movimentações de um SKU, paginadas, em ordem cronológica                                             |
| Reserva do pedido       | `ReserveStockForOrderHandler`                | Ao confirmar um pedido, reserva todos os itens ou nenhum (RN12)                                      |
| Falta de estoque        | `StockShortageError`                         | Itens do pedido além do disponível, todos listados de uma vez; SKU sem estoque conta como zero       |
| Baixa do pedido         | `CommitStockForOrderHandler`                 | Ao pagar, as reservas viram baixa (RN13)                                                             |
| Devolução ao estoque    | `ReturnStockForCancelledOrderHandler`        | Ao cancelar: pedido confirmado libera a reserva; pedido pago devolve as unidades como entrada (RN13) |

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

## Integração entre contextos (`integration` e `shared`)

| Termo                | Código                     | Definição                                                                                           |
| -------------------- | -------------------------- | --------------------------------------------------------------------------------------------------- |
| Evento de domínio    | `DomainEvent`              | Fato do negócio, no passado, registrado por um agregado                                             |
| Publicar eventos     | `EventPublisher.publish()` | Entregar os eventos de uma operação a quem os ouve, sem saber quem é                                |
| Dispatcher           | `EventDispatcher`          | Entrega cada evento aos handlers inscritos no nome dele, um de cada vez; o primeiro erro interrompe |
| Handler              | `EventHandler`             | A reação de um contexto a um evento                                                                 |
| Mensagem             | `OrderLinesMessage`        | Um evento de outro contexto como quem o recebe o lê: só os campos que usa                           |
| Transação            | `Transaction`              | Tudo o que a operação gravou fica gravado junto, ou nada fica                                       |
| Camada anticorrupção | `ProductCatalogAdapter`    | Traduz o modelo de um contexto para a linguagem de quem o consome                                   |
| Camada de integração | `src/integration`          | Liga os contextos (adaptadores e inscrições); conhece todos, e nenhum a conhece                     |

## Persistência (`infrastructure/persistence` e `shared/infrastructure/database`)

| Termo                   | Código                    | Definição                                                                                   |
| ----------------------- | ------------------------- | ------------------------------------------------------------------------------------------- |
| Repositório             | `PrismaOrderRepository`   | Implementação de uma porta de repositório: traduz agregados em linhas e linhas em agregados |
| Contrato do repositório | `orderRepositoryContract` | Os testes que toda implementação de uma porta precisa passar, o fake e a do banco           |
| Mapper                  | `order-row.mapper.ts`     | Traduz o snapshot de um agregado para as colunas do banco, e de volta                       |
| Migration               | `prisma/migrations`       | Uma mudança no schema do banco, versionada e aplicada em ordem                              |
| Banco de testes         | `loja_agil_test`          | O banco dos testes de integração, zerado antes de cada teste                                |
| Transação em curso      | `PrismaDatabase.client()` | O client da transação aberta por `run`, ou o principal fora dela                            |
| Versão                  | `version`                 | Quantas vezes o item de estoque foi gravado; base do travamento otimista                    |
| Travamento otimista     | `ConcurrentUpdateError`   | Grava só se ninguém gravou depois da leitura; quem perde a corrida tenta de novo            |
