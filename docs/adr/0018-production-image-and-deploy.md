# 0018. Imagem de produção, entrega contínua e deploy

- **Status:** aceita
- **Data:** 2026-11-12

## Contexto

Até o módulo 15, a aplicação só rodava com `nest start --watch`, dentro do container de desenvolvimento. Nada garantia que o código compilado subisse sozinho: o primeiro build da imagem de produção gerou um client do Prisma que importava arquivos `.ts`, e a aplicação não iniciou. Uma plataforma também espera coisas que o desenvolvimento não pede: saber quando a instância está pronta, mandar `SIGTERM` antes de desligá-la, ler logs de uma saída só e aplicar as migrations antes da versão nova.

## Decisão

- **Duas rotas de saúde.** `GET /health` diz que o processo está de pé. `GET /health/ready` pergunta ao banco (`SELECT 1`) e responde 503 com `NOT_READY` quando ele não responde. A plataforma manda tráfego só para a instância pronta.
- **Logs estruturados com pino.** Uma linha JSON por evento, com o nível vindo de `LOG_LEVEL`, um `reqId` por requisição (o `x-request-id` que chega, se for válido) e campos sensíveis apagados (o cabeçalho `authorization`, cookies e senhas). As sondas de saúde não geram linha. O formato legível (`pino-pretty`) é só para o desenvolvimento.
- **Encerramento gracioso.** No `SIGTERM`, o servidor para de aceitar conexões, termina as requisições em andamento (as respostas levam `Connection: close`) e só então desconecta o banco e sai com 0.
- **Imagem multi-stage**, com dependências de produção, build e execução. A imagem roda como `node`, com o Node como PID 1 (`CMD ["node", "dist/main.js"]`), e não leva código-fonte, testes nem `.env` (`.dockerignore`). O gerador do Prisma fixa `importFileExtension = "js"`.
- **Migrations como passo de release**, com a mesma imagem (`node_modules/.bin/prisma migrate deploy`), antes de a versão nova subir. Não rodam na inicialização: com duas instâncias, as duas tentariam migrar ao mesmo tempo.
- **CD depois do CI na `main`.** O workflow `CD` monta a imagem, sobe-a num smoke test (migrations num banco vazio, `/health/ready` com 200 e `SIGTERM` com saída 0) e publica no GHCR com a tag do sha e `latest`. Publica-se o commit que o CI aprovou, e cada versão fica disponível pelo sha para um rollback.
- **Render como plataforma de exemplo**, descrito no `render.yaml`: um serviço web que roda a imagem, um Postgres gerenciado, o health check em `/health/ready`, o `preDeployCommand` com as migrations e um `JWT_SECRET` gerado pela própria plataforma. Com o secret `RENDER_DEPLOY_HOOK_URL`, o CD pede o deploy da tag do sha. Sem ele, só publica.

### Para pôr no ar (feito uma vez, por quem tem a conta)

1. No GitHub, criar um token clássico com `read:packages`. No Render, em _Workspace Settings → Registry Credentials_, cadastrá-lo com o nome `ghcr` (o pacote é privado como o repositório).
2. No Render, _New → Blueprint_, apontando para este repositório. O Render cria o banco e o serviço do `render.yaml`.
3. Copiar o _Deploy Hook_ do serviço para o secret `RENDER_DEPLOY_HOOK_URL` do repositório. A partir daí, cada merge na `main` vira um deploy.
4. Cadastrar a primeira conta por `POST /users` e promovê-la no _Shell_ do serviço: `node dist/cli/promote-operator.js <email>`.

## Consequências

- O que vai para produção é testado como imagem antes de ser publicado. Um defeito como o dos imports `.ts` para no CD, e não na plataforma.
- A imagem tem uns 550 MB. O Prisma CLI e o TypeScript entram como _peer dependencies_ do `@prisma/client`, mesmo com `--omit=dev`. O CLI é o que aplica as migrations, então fica.
- O Render usa o mesmo health check para receber tráfego e para reiniciar a instância. Com o banco fora do ar, ele reinicia uma instância que não tem culpa. Aceitamos isso: nesse caso, ela não atenderia ninguém de qualquer jeito.
- **A acompanhar:** a ordenação de texto em português vem do locale ICU `pt-BR` com que o compose cria o banco. Um Postgres gerenciado é criado com o locale da plataforma, e a ordem de nomes com acento pode mudar. Isso tem de ser conferido no primeiro deploy. Se mudar, a correção é uma migration com `COLLATE "pt-BR-x-icu"` nas colunas ordenadas.
- O `preDeployCommand` exige um plano pago no Render. No free, as migrations teriam de rodar à mão.
