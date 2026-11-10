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
| SKU                   | `Sku`                                                 | Código único do produto, `ABC123[-VAR]` (ex.: `CAM123-AZUL`)        |
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

| Termo do negócio | Código                   | Definição                                                      |
| ---------------- | ------------------------ | -------------------------------------------------------------- |
| Item de estoque  | `StockItem`              | Saldo de um SKU no depósito                                    |
| Estoque físico   | `onHand`                 | Quantidade que existe no depósito                              |
| Reserva          | `reserve()` / `reserved` | Quantidade separada para pedidos confirmados e ainda não pagos |
| Disponível       | `available()`            | `onHand − reserved`; o que ainda pode ser vendido              |
| Baixa            | `commit()`               | Saída definitiva do estoque quando o pedido é pago             |
| Estoque mínimo   | `minimumLevel`           | Abaixo dele a loja é alertada (`LowStockDetected`)             |

## Pedidos (`ordering`)

| Termo do negócio | Código                | Definição                                             |
| ---------------- | --------------------- | ----------------------------------------------------- |
| Pedido           | `Order`               | Intenção de compra de um cliente; agregado raiz       |
| Item do pedido   | `OrderItem`           | SKU, preço congelado e quantidade                     |
| Rascunho         | `OrderStatus.DRAFT`   | Pedido ainda editável                                 |
| Confirmar pedido | `Order.place()`       | Fecha o pedido e solicita a reserva de estoque        |
| Pago             | `OrderStatus.PAID`    | Pagamento aprovado; estoque baixado                   |
| Enviado          | `OrderStatus.SHIPPED` | Pedido despachado; não pode mais ser cancelado        |
| Cancelar         | `Order.cancel()`      | Encerra o pedido e libera as reservas                 |
| Cupom            | `Coupon`              | Desconto percentual com teto e valor mínimo de pedido |
