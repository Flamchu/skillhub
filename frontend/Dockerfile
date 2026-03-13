# multi-stage dockerfile for frontend (next.js)

# stage 1: dependencies
FROM node:25-bookworm-slim AS deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# install pnpm
RUN npm install -g pnpm@10.30.3

# copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY frontend/package.json ./frontend/

# install dependencies (including dev dependencies for build)
RUN pnpm install --frozen-lockfile --filter frontend...

# stage 2: builder
FROM node:25-bookworm-slim AS builder
WORKDIR /app

# install pnpm
RUN npm install -g pnpm@10.30.3

# copy source code first (excluding node_modules)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY frontend/package.json frontend/next.config.ts frontend/tailwind.config.js frontend/postcss.config.mjs frontend/eslint.config.mjs frontend/tsconfig.json ./frontend/
COPY frontend/src ./frontend/src
COPY frontend/public ./frontend/public

# copy dependencies from deps stage (after source code)
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules

WORKDIR /app/frontend

# set build-time environment variables
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_MEDIA_URL
ARG NEXT_PUBLIC_DEFAULT_THEME
ARG NEXT_PUBLIC_ENABLE_ANALYTICS
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_MEDIA_URL=$NEXT_PUBLIC_MEDIA_URL
ENV NEXT_PUBLIC_DEFAULT_THEME=$NEXT_PUBLIC_DEFAULT_THEME
ENV NEXT_PUBLIC_ENABLE_ANALYTICS=$NEXT_PUBLIC_ENABLE_ANALYTICS

# build next.js app
RUN pnpm build

# stage 3: runner
FROM node:25-bookworm-slim AS runner
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# install pnpm BEFORE creating user
RUN npm install -g pnpm@10.30.3

# create non-root user
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nextjs --create-home

# create corepack cache directory with proper permissions
RUN mkdir -p /home/nextjs/.cache/node/corepack && \
    chown -R nextjs:nodejs /home/nextjs/.cache

# copy next.js standalone build output (includes server and dependencies)
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/standalone ./

# copy static assets to the correct location within standalone structure
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/static ./frontend/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/frontend/public ./frontend/public

# copy messages directory for next-intl runtime  
COPY --from=builder --chown=nextjs:nodejs /app/frontend/src/messages ./frontend/src/messages

# copy i18n config for next-intl
COPY --from=builder --chown=nextjs:nodejs /app/frontend/src/i18n.ts ./frontend/src/i18n.ts

# fix ownership of all files
RUN chown -R nextjs:nodejs /app

USER nextjs

# work from the frontend directory where server.js expects to run
WORKDIR /app/frontend

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
