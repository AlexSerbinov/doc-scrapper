#!/bin/bash

# Doc Scrapper Docker Stop Script
# Usage: ./docker-stop.sh [--clean]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ENV_FILE="docker.env"
CLEAN_FLAG=""

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --clean)
      CLEAN_FLAG="--clean"
      shift
      ;;
    -h|--help)
      echo "Usage: $0 [--clean]"
      echo "  --clean: Remove containers, networks, and images"
      exit 0
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

echo -e "${BLUE}🛑 Stopping Doc Scrapper Docker Environment${NC}"

# Stop services
echo -e "${YELLOW}⏹️ Stopping Docker services...${NC}"
docker-compose --env-file="$ENV_FILE" down

if [[ -n "$CLEAN_FLAG" ]]; then
    echo -e "${YELLOW}🧹 Cleaning up Docker resources...${NC}"
    
    # Remove images
    echo -e "${YELLOW}🗑️ Removing Docker images...${NC}"
    docker-compose --env-file="$ENV_FILE" down --rmi all --remove-orphans
    
    # Remove volumes (keeping data by default, uncomment if needed)
    # echo -e "${YELLOW}💾 Removing Docker volumes...${NC}"
    # docker-compose --env-file="$ENV_FILE" down --volumes
    
    # Clean unused Docker resources
    echo -e "${YELLOW}🗑️ Cleaning unused Docker resources...${NC}"
    docker system prune -f
fi

echo -e "${GREEN}✅ Doc Scrapper services stopped successfully${NC}"

if [[ -z "$CLEAN_FLAG" ]]; then
    echo -e "${BLUE}💡 Tip: Use ${YELLOW}--clean${BLUE} flag to remove images and free up space${NC}"
    echo -e "${BLUE}💡 Data is preserved in Docker volumes${NC}"
fi 