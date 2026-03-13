#!/bin/bash

# deploy.sh - deployment script for hetzner
set -e

echo "🚀 Starting SkillHub deployment..."

# colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # no color

# check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${RED}❌ Error: .env.production file not found${NC}"
    echo "Please create .env.production from .env.example"
    exit 1
fi

# resolve ghcr namespace from the origin remote when not provided
if [ -z "${GHCR_NAMESPACE:-}" ]; then
    REMOTE_URL=$(git config --get remote.origin.url)
    REPO_PATH=$(printf '%s\n' "${REMOTE_URL}" | sed -E 's#(git@github.com:|https://github.com/)##; s#\.git$##')
    GHCR_NAMESPACE="ghcr.io/$(printf '%s\n' "${REPO_PATH}" | tr '[:upper:]' '[:lower:]')"
fi

IMAGE_TAG=${IMAGE_TAG:-master}
export GHCR_NAMESPACE
export IMAGE_TAG

# Git pull
echo -e "${YELLOW}📦 Pulling latest changes...${NC}"
git fetch origin master
git checkout master
git pull --ff-only origin master

# Pull latest images
echo -e "${YELLOW}📥 Pulling latest images...${NC}"
docker compose --env-file .env.production -f docker-compose.prod.yml pull

# Run DB migrations using service environment
echo -e "${YELLOW}🔄 Running database migrations...${NC}"
docker compose --env-file .env.production -f docker-compose.prod.yml run --rm --no-deps backend pnpm prisma:migrate:deploy

# Start stack
echo -e "${YELLOW}🚀 Starting containers...${NC}"
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --remove-orphans

# Cleanup dangling images only (safer)
echo -e "${YELLOW}🧹 Cleaning up unused images...${NC}"
docker image prune -f

# Wait for services to start
echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 15

# Check service status
echo -e "${YELLOW}🔍 Checking service status...${NC}"
docker compose --env-file .env.production -f docker-compose.prod.yml ps

echo -e "${GREEN}✅ Deployment successful!${NC}"
echo -e "${GREEN}🌐 Application is running${NC}"
echo -e "${YELLOW}💡 Check logs with: docker compose --env-file .env.production -f docker-compose.prod.yml logs -f${NC}"
