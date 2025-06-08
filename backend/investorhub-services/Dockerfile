# Etapa base com pnpm ativado
FROM node:slim AS base

RUN corepack enable && corepack prepare pnpm@latest --activate

# Etapa de dependências (inclui devDependencies)
FROM base AS deps

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Etapa de build
FROM base AS build

WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN pnpm run build

# Etapa final - runtime
FROM node:slim AS runtime

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules

EXPOSE 3000
CMD ["node", "dist/main"]