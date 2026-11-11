# 0014. Autenticação com JWT e autorização por guards globais

- **Status:** aceita
- **Data:** 2026-11-11

## Contexto

Até o módulo 11, a API acreditava em quem dizia ser alguém: os pedidos identificavam o cliente pelo header `x-customer-id` (ADR 0013), e qualquer rota estava aberta a qualquer um. Três regras ficavam de fora: só o operador administra a loja (RN03), o cliente só vê e muda os próprios pedidos (RN15) e cada usuário cuida da própria conta.

A API é consumida por clientes diversos (web, mobile, integrações), roda em uma ou mais instâncias atrás de um balanceador e não tem, ainda, um armazenamento de sessão.

## Decisão

- **Token de acesso JWT, sem estado no servidor.** `POST /auth/sign-in` confere as credenciais pelo `SignInUseCase` e responde `{ accessToken, tokenType: "Bearer", expiresInSeconds }`. O token leva só `sub` (o id do usuário) e `role`; nunca dados pessoais.
- **HS256 com segredo de pelo menos 32 caracteres**, na assinatura e na verificação. A verificação aceita só HS256: sem essa lista, a biblioteca aceitaria outro HMAC com o mesmo segredo. `JWT_SECRET` é obrigatório (a aplicação não sobe sem ele) e `JWT_EXPIRES_IN_SECONDS` vale 3600 por padrão.
- **O JWT é assunto da borda.** O caso de uso diz quem é o usuário; o `AccessTokens`, em `shared/infrastructure/auth/`, emite e confere o token. Domínio e aplicação não conhecem o JWT.
- **Negar por padrão.** O `AuthGuard` é global (`APP_GUARD`): toda rota exige `Authorization: Bearer <token>`, menos as marcadas com `@Public()`: `GET /health`, `POST /users`, `POST /auth/sign-in`, `GET /products` e `GET /products/:id`. Rota nova nasce protegida.
- **Perfis por decorator.** O `RolesGuard`, também global e registrado depois, lê `@Roles(OPERATOR)` e responde 403 ao perfil errado. 401 quer dizer "não sei quem você é"; 403, "sei, e você não pode".
- **O primeiro operador nasce no servidor.** `npm run operator:promote -- <email>` usa o mesmo `PromoteToOperatorUseCase` da rota `POST /operators`, que só um operador chama.
- **A posse é regra da aplicação, não da borda.** Os casos de uso do cliente recebem o `customerId` do token e carregam o pedido por `loadCustomerOrder`, que pergunta ao agregado (`order.belongsTo`). O pedido de outro cliente responde 404 `ORDER_NOT_FOUND`, igual a um pedido inexistente.
- **A própria conta em `/me`.** Perfil, senha e exclusão usam o usuário do token, sem id na URL. `GET /users/:id` é só do operador.

## Consequências

- Qualquer instância confere o token sozinha, sem consultar banco nem sessão.
- Um token emitido vale até expirar: não há logout no servidor, e um usuário excluído continua com o token antigo até o fim da validade. `GET /me` de uma conta excluída responde 404. Revogação (lista de bloqueio ou refresh token curto) fica para quando houver necessidade.
- Trocar o `JWT_SECRET` invalida todos os tokens de uma vez, o que serve de botão de emergência.
- O perfil é lido do token, não do banco: uma promoção só vale no próximo login.
- O pedido de outro cliente é indistinguível de um inexistente, o que impede descobrir ids válidos.
- O valor `OPERATOR` existe na Identidade (`Role`) e no Shared Kernel (`roles.ts`), porque o kernel não importa contextos; um teste mantém os dois iguais (`identity/infrastructure/http/operator-role.spec.ts`, desde a ADR 0015).
- O header provisório `x-customer-id` deixou de existir: só a função `currentCustomerOf` mudou, e controllers e casos de uso seguiram recebendo um `customerId`.
