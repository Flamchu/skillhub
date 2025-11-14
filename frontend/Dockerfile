# multi-stage dockerfile for frontend (next.js)

# stage 1: dependencies
FROM node:24-bookworm-slim AS deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# enable corepack for yarn
RUN corepack enable && corepack prepare yarn@4.9.4 --activate

# copy package files
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
COPY frontend/package.json ./frontend/

# install dependencies (including dev dependencies)
RUN yarn workspaces focus frontend

# stage 2: builder
FROM node:24-bookworm-slim AS builder
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
COPY frontend ./frontend

WORKDIR /app/frontend

# set build-time environment variables
ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL

# build next.js app
RUN yarn build

# stage 3: runner
FROM node:24-bookworm-slim AS runner
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# create non-root user
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nextjs

# copy necessary files (skip public if it doesn't exist)
COPY --from=builder --chown=nextjs:nodejs /app/frontend/ ./

USER nextjs

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD wget --no-verbose --tries=1 --spider https://skillhub.lopataa.site:3000 || exit 1

RUN yarn install --immutable
CMD ["yarn", "start"]
