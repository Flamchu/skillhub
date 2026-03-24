# multi-stage dockerfile for backend (node.js + express + prisma)
ARG DEBIAN_FRONTEND=noninteractive

# stage 1: dependencies
FROM node:24-bookworm-slim AS deps
ENV DEBIAN_FRONTEND=noninteractive
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# enable pnpm via corepack
RUN corepack enable

# copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY backend/package.json ./backend/
COPY backend/prisma ./backend/prisma
COPY backend/prisma.config.ts ./backend/

# install dependencies (including dev dependencies for build)
RUN pnpm install --frozen-lockfile --filter backend... --reporter=silent

# stage 2: builder
FROM node:24-bookworm-slim AS builder
ENV DEBIAN_FRONTEND=noninteractive
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# enable pnpm via corepack
RUN corepack enable

# copy source code first (excluding node_modules)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY backend/package.json backend/tsconfig.json backend/prisma.config.ts ./backend/
COPY backend/prisma ./backend/prisma
COPY backend/src ./backend/src

# copy dependencies from deps stage (after source code)
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules

# generate prisma client
WORKDIR /app/backend
RUN pnpm prisma generate

# build typescript
RUN pnpm build

# stage 3: runner
FROM node:24-bookworm-slim AS runner
ENV DEBIAN_FRONTEND=noninteractive
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# enable pnpm via corepack
RUN corepack enable

# create non-root user
RUN groupadd --gid 1001 nodejs && \
    useradd --uid 1001 --gid nodejs backend --create-home

# copy package files
COPY --from=builder --chown=backend:nodejs /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/.npmrc ./
COPY --from=builder --chown=backend:nodejs /app/backend/package.json ./backend/
COPY --from=builder --chown=backend:nodejs /app/backend/prisma.config.ts ./backend/

# copy prisma schema BEFORE installing dependencies (needed for prisma generate)
COPY --from=builder --chown=backend:nodejs /app/backend/prisma ./backend/prisma

# install production dependencies only (as root to avoid permission issues)
RUN pnpm install --frozen-lockfile --prod --filter backend... --reporter=silent

# generate prisma client for production
WORKDIR /app/backend
RUN pnpm prisma generate

# copy backend build output
WORKDIR /app
COPY --from=builder --chown=backend:nodejs /app/backend/dist ./backend/dist

# fix ownership of all files
RUN chown -R backend:nodejs /app

USER backend

WORKDIR /app/backend

EXPOSE 4000

ENV NODE_ENV=production
ENV PORT=4000

CMD ["node", "dist/express.js"]
