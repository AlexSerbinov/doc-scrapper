#!/bin/bash

echo "🛑 Doc Scrapper AI - Stop All Services"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to kill processes on specific ports
kill_port() {
    local port=$1
    local name=$2
    
    print_status "Stopping $name on port $port..."
    
    if lsof -ti:$port > /dev/null 2>&1; then
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 1
        
        if lsof -ti:$port > /dev/null 2>&1; then
            print_warning "Some processes on port $port may still be running"
        else
            print_success "$name stopped"
        fi
    else
        print_success "$name was not running"
    fi
}

# Kill all our services
kill_port 8000 "ChromaDB"
kill_port 8001 "RAG API" 
kill_port 3000 "Web App"
kill_port 3001 "Web App (fallback)"

# Kill specific processes
print_status "Killing node processes..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "chroma run" 2>/dev/null || true
pkill -f "rag/server" 2>/dev/null || true

echo
print_success "All services stopped!"
print_warning "To restart everything, run: npm run restart" 