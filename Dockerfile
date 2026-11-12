# Imagem de produção em três estágios: só o último vai para o registro.

# 1. Dependências de produção, sem scripts: o client do Prisma já vem compilado
#    do estágio de build, e nenhum pacote roda código na instalação.
FROM node:26-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

# 2. Build: todas as dependências, o client gerado e o TypeScript compilado.
FROM node:26-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci
COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build

# 3. Execução: Node, as dependências de produção e o JavaScript. Sem testes e
#    sem código-fonte. O Prisma CLI (e o TypeScript) vêm junto, como peers do
#    @prisma/client: é o CLI que aplica as migrations no passo de release.
FROM node:26-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --chown=node:node package.json ./
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node prisma.config.ts ./
COPY --chown=node:node prisma ./prisma
# O usuário "node" (uid 1000) já existe na imagem oficial: o processo não é root.
USER node
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:3000/health || exit 1
# Forma exec, sem npm nem shell no meio: o Node é o PID 1 e recebe o SIGTERM.
CMD ["node", "dist/main.js"]
