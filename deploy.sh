#!/bin/bash

# deploy.sh - deployment script for hetzner
set -e

echo "🚀 Starting SkillHub deployment..."

# colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # no color

# check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo "Please create .env file from .env.example"
    exit 1
fi

# Git pull
echo -e "${YELLOW}📦 Pulling latest changes...${NC}"
git pull origin master

# Stop running containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker compose -f docker-compose.prod.yml down

# Build clean images
echo -e "${YELLOW}🏗️  Building images...${NC}"
docker compose -f docker-compose.prod.yml build --no-cache

# Run DB migrations using service environment
echo -e "${YELLOW}🔄 Running database migrations...${NC}"
docker compose -f docker-compose.prod.yml run --rm backend sh -c "yarn prisma:migrate:deploy"

# Start stack
echo -e "${YELLOW}🚀 Starting containers...${NC}"
docker compose -f docker-compose.prod.yml up -d

# Cleanup dangling images only (safer)
echo -e "${YELLOW}🧹 Cleaning up unused images...${NC}"
docker image prune -f --filter "dangling=true"

# Wait for health checks
echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
sleep 10

# Check service health
echo -e "${YELLOW}🔍 Checking service health...${NC}"
if docker compose -f docker-compose.prod.yml ps | grep -q "unhealthy"; then
    echo -e "${RED}❌ Some services are unhealthy${NC}"
    docker compose -f docker-compose.prod.yml ps
    exit 1
fi

echo -e "${GREEN}✅ Deployment successful!${NC}"
echo -e "${GREEN}🌐 Application is running${NC}"
