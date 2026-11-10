# Códigos de erro da API

Cada erro de domínio tem um `code` estável (ADR 0003). Clientes da API devem decidir pelo `code`, nunca pela mensagem, que pode mudar.
O status HTTP é definido na infraestrutura (módulo 11); a coluna abaixo é a proposta atual.

## Shared Kernel

| Código       | Classe           | Quando acontece                    | HTTP |
| ------------ | ---------------- | ---------------------------------- | ---- |
| `INVALID_ID` | `InvalidIdError` | Identificador fora do formato UUID | 400  |

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

Ao criar um erro de domínio, acrescente uma linha aqui no mesmo pull request.
