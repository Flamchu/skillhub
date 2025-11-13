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

# load environment variables
export $(cat .env | grep -v '^#' | xargs)

echo -e "${YELLOW}📦 Pulling latest changes...${NC}"
git pull origin main

echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose -f docker-compose.prod.yml down

echo -e "${YELLOW}🏗️  Building images...${NC}"
docker-compose -f docker-compose.prod.yml build --no-cache

echo -e "${YELLOW}🔄 Running database migrations...${NC}"
docker-compose -f docker-compose.prod.yml run --rm backend yarn prisma:migrate:deploy

echo -e "${YELLOW}🚀 Starting containers...${NC}"
docker-compose -f docker-compose.prod.yml up -d

echo -e "${YELLOW}🧹 Cleaning up unused images...${NC}"
docker image prune -f

echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
sleep 10

# check service health
echo -e "${YELLOW}🔍 Checking service health...${NC}"
if docker-compose -f docker-compose.prod.yml ps | grep -q "unhealthy"; then
    echo -e "${RED}❌ Some services are unhealthy${NC}"
    docker-compose -f docker-compose.prod.yml ps
    exit 1
fi

echo -e "${GREEN}✅ Deployment successful!${NC}"
echo -e "${GREEN}🌐 Application is running${NC}"
echo ""
echo "Useful commands:"
echo "  - View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "  - Stop services: docker-compose -f docker-compose.prod.yml down"
echo "  - Restart services: docker-compose -f docker-compose.prod.yml restart"
echo "  - Check status: docker-compose -f docker-compose.prod.yml ps"
