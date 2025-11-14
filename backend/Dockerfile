# multi-stage dockerfile for backend (node.js + express + prisma)

# stage 1: dependencies
FROM node:24-bookworm-slim AS deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# enable corepack for yarn
RUN corepack enable && corepack prepare yarn@4.9.4 --activate

# copy package files
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
COPY backend/package.json ./backend/

# install dependencies (including dev dependencies)
RUN yarn workspaces focus backend

# stage 2: builder
FROM node:24-bookworm-slim AS builder
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# enable corepack for yarn
RUN corepack enable && corepack prepare yarn@4.9.4 --activate

# copy dependencies from deps stage (yarn berry with node-modules linker)
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/.yarn ./.yarn
COPY --from=deps /app/.pnp.cjs* ./
COPY --from=deps /app/.pnp.loader.mjs* ./

# copy source code
COPY package.json yarn.lock .yarnrc.yml ./
COPY backend ./backend

# generate prisma client
WORKDIR /app/backend
RUN yarn prisma generate

# build typescript
RUN yarn build

# stage 3: runner
FROM node:24-bookworm-slim AS runner
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# create non-root user
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs backend

    # install dependencies
RUN corepack enable \
 && corepack prepare yarn@4.9.4 --activate \
 && yarn install --immutable

# copy yarn configuration
COPY --from=builder --chown=backend:nodejs /app/package.json /app/yarn.lock /app/.yarnrc.yml ./
COPY --from=builder --chown=backend:nodejs /app/.yarn ./.yarn
COPY --from=builder --chown=backend:nodejs /app/node_modules ./node_modules

# copy backend build output and config
COPY --from=builder --chown=backend:nodejs /app/backend/dist ./backend/dist
COPY --from=builder --chown=backend:nodejs /app/backend/prisma ./backend/prisma
COPY --from=builder --chown=backend:nodejs /app/backend/package.json ./backend/

USER backend

WORKDIR /app/backend

EXPOSE 4000

ENV NODE_ENV=production
ENV PORT=4000

# health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('https://skillhub.lopataa.site:4000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/express.js"]
