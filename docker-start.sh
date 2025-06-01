#!/bin/bash

# Doc Scrapper Docker Startup Script
# Usage: ./docker-start.sh [--build] [--prod|--dev]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
BUILD_FLAG=""
ENV_FILE="docker.env"
COMPOSE_PROFILE="production"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --build)
      BUILD_FLAG="--build"
      shift
      ;;
    --dev|--development)
      COMPOSE_PROFILE="development"
      shift
      ;;
    --prod|--production)
      COMPOSE_PROFILE="production"
      shift
      ;;
    -h|--help)
      echo "Usage: $0 [--build] [--prod|--dev]"
      echo "  --build: Force rebuild of Docker images"
      echo "  --prod:  Production profile (default)"
      echo "  --dev:   Development profile"
      exit 0
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

echo -e "${BLUE}🐳 Starting Doc Scrapper Docker Environment${NC}"
echo -e "${YELLOW}Profile: ${COMPOSE_PROFILE}${NC}"

# Check if docker.env exists
if [[ ! -f "$ENV_FILE" ]]; then
    echo -e "${RED}❌ Error: $ENV_FILE file not found${NC}"
    echo -e "${YELLOW}Please copy docker.env.example to docker.env and configure your settings${NC}"
    exit 1
fi

# Check if OPENAI_API_KEY is set
if grep -q "your_openai_api_key_here" "$ENV_FILE"; then
    echo -e "${RED}❌ Warning: Please set your OPENAI_API_KEY in $ENV_FILE${NC}"
    echo -e "${YELLOW}The system will start but RAG functionality won't work without a valid API key${NC}"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Create necessary directories
echo -e "${BLUE}📁 Creating necessary directories...${NC}"
mkdir -p docker/nginx/ssl
mkdir -p scraped-docs
mkdir -p chroma_data

# Check if TypeScript is built
if [[ ! -d "dist" ]]; then
    echo -e "${YELLOW}⚠️  TypeScript not built. Building now...${NC}"
    npm run build
fi

# Check if web-app is built
if [[ ! -d "web-app/.next" ]]; then
    echo -e "${YELLOW}⚠️  Web app not built. Building now...${NC}"
    cd web-app
    npm run build
    cd ..
fi

# Start Docker Compose
echo -e "${BLUE}🚀 Starting Docker services...${NC}"

if [[ -n "$BUILD_FLAG" ]]; then
    echo -e "${YELLOW}🔨 Building Docker images...${NC}"
fi

docker-compose --env-file="$ENV_FILE" up $BUILD_FLAG -d

# Wait for services to be healthy
echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"

# Function to check service health
check_service() {
    local service_name=$1
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if docker-compose --env-file="$ENV_FILE" ps "$service_name" | grep -q "healthy"; then
            echo -e "${GREEN}✅ $service_name is ready${NC}"
            return 0
        fi
        
        echo -e "${YELLOW}⏳ Waiting for $service_name... (attempt $attempt/$max_attempts)${NC}"
        sleep 5
        ((attempt++))
    done
    
    echo -e "${RED}❌ $service_name failed to become healthy${NC}"
    return 1
}

# Check each service
check_service "chromadb"
check_service "rag-api"  
check_service "web-app"
check_service "nginx"

echo -e "${GREEN}🎉 All services are running!${NC}"
echo
echo -e "${BLUE}📋 Service URLs:${NC}"
echo -e "🌐 Main Application: ${GREEN}https://localhost${NC}"
echo -e "🔒 Secure Web App:   ${GREEN}https://localhost:443${NC}"
echo -e "📝 HTTP Redirect:    ${YELLOW}http://localhost:80${NC} → ${GREEN}https://localhost${NC}"
echo
echo -e "${BLUE}🔧 Debug URLs (optional):${NC}"
echo -e "🤖 RAG API:          ${YELLOW}https://localhost/rag-api${NC}"
echo -e "💾 ChromaDB:         ${YELLOW}https://localhost/chromadb${NC}"
echo
echo -e "${BLUE}📊 Management Commands:${NC}"
echo -e "View logs:     ${YELLOW}docker-compose --env-file=$ENV_FILE logs -f${NC}"
echo -e "Stop services: ${YELLOW}docker-compose --env-file=$ENV_FILE down${NC}"
echo -e "Restart:       ${YELLOW}./docker-start.sh --build${NC}"
echo
echo -e "${GREEN}✨ Doc Scrapper is ready to use!${NC}" 