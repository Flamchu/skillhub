# multi-stage dockerfile for frontend (next.js)

# stage 1: dependencies
FROM node:24-bookworm-slim AS deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@10.22.0 --activate

# copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY frontend/package.json ./frontend/

# install dependencies (including dev dependencies for build)
RUN pnpm install --frozen-lockfile --filter frontend...

# stage 2: builder
FROM node:24-bookworm-slim AS builder
WORKDIR /app

# enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@10.22.0 --activate

# copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules

# copy source code
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY frontend ./frontend

WORKDIR /app/frontend

# set build-time environment variables
ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL

# build next.js app
RUN pnpm build

# stage 3: runner
FROM node:24-bookworm-slim AS runner
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# create non-root user
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nextjs

# enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@10.22.0 --activate

# copy package files
COPY --from=builder --chown=nextjs:nodejs /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/.npmrc ./
COPY --from=builder --chown=nextjs:nodejs /app/frontend/package.json ./frontend/

# install production dependencies only
RUN pnpm install --frozen-lockfile --prod --filter frontend...

# copy next.js build output
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next ./frontend/.next
COPY --from=builder --chown=nextjs:nodejs /app/frontend/public ./frontend/public
COPY --from=builder --chown=nextjs:nodejs /app/frontend/next.config.ts ./frontend/

USER nextjs

WORKDIR /app/frontend

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD wget --no-verbose --tries=1 --spider https://skillhub.lopataa.site:3000 || exit 1

CMD ["pnpm", "start"]
