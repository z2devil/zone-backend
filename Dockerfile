FROM node:22.20.0-slim AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.17.1 --activate

COPY package.json pnpm-lock.yaml tsconfig.json ./
RUN pnpm install --frozen-lockfile

COPY src ./src
RUN pnpm build && pnpm prune --prod

FROM node:22.20.0-slim AS runtime

ARG APP_VERSION=dev
ENV NODE_ENV=production \
    APP_VERSION=${APP_VERSION}

LABEL org.opencontainers.image.revision=${APP_VERSION}

WORKDIR /app

COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/build ./build

USER node

EXPOSE 2333

CMD ["node", "build/app.js"]
