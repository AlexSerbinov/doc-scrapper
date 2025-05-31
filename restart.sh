#!/bin/bash
set -e

echo "🔥 Doc Scrapper AI - Universal Restart Script"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to kill processes on specific ports
kill_port() {
    local port=$1
    local name=$2
    
    print_status "Checking port $port ($name)..."
    
    if lsof -ti:$port > /dev/null 2>&1; then
        print_warning "Killing processes on port $port..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 1
        
        # Double check
        if lsof -ti:$port > /dev/null 2>&1; then
            print_error "Failed to kill processes on port $port"
            lsof -i:$port
        else
            print_success "Port $port cleared"
        fi
    else
        print_success "Port $port already free"
    fi
}

# Step 1: Kill all processes on our ports
echo
print_status "Step 1: Clearing all ports..."
kill_port 8000 "ChromaDB"
kill_port 8001 "RAG API" 
kill_port 3000 "Web App"
kill_port 3001 "Web App (fallback)"

# Also kill any node processes that might be hanging
print_status "Killing any hanging node processes..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "chroma run" 2>/dev/null || true
pkill -f "rag/server" 2>/dev/null || true
sleep 2

# Step 2: Build everything
echo
print_status "Step 2: Building projects..."

print_status "Building main TypeScript project..."
if npm run build; then
    print_success "Main project built successfully"
else
    print_error "Main project build failed!"
    exit 1
fi

print_status "Building web app..."
cd web-app
if npm run build; then
    print_success "Web app built successfully"
else
    print_error "Web app build failed!"
    exit 1
fi
cd ..

# Step 3: Start everything
echo
print_status "Step 3: Starting all services..."

print_status "Starting ChromaDB..."
npm run chroma:start > /dev/null 2>&1 &
CHROMA_PID=$!
sleep 3

# Check if ChromaDB started successfully
if curl -s http://localhost:8000/api/v1/heartbeat > /dev/null 2>&1; then
    print_success "ChromaDB started successfully on port 8000"
else
    print_error "ChromaDB failed to start!"
    kill $CHROMA_PID 2>/dev/null || true
    exit 1
fi

print_status "Starting RAG API..."
npm run rag:server > /dev/null 2>&1 &
RAG_PID=$!
sleep 3

# Check if RAG API started successfully  
if curl -s http://localhost:8001 > /dev/null 2>&1; then
    print_success "RAG API started successfully on port 8001"
else
    print_error "RAG API failed to start!"
    kill $RAG_PID 2>/dev/null || true
    kill $CHROMA_PID 2>/dev/null || true
    exit 1
fi

print_status "Starting Web App..."
cd web-app
npm run dev > /dev/null 2>&1 &
WEB_PID=$!
sleep 5

# Check if Web App started successfully
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    print_success "Web App started successfully on port 3000"
    WEB_PORT=3000
elif curl -s http://localhost:3001 > /dev/null 2>&1; then
    print_success "Web App started successfully on port 3001"
    WEB_PORT=3001
else
    print_error "Web App failed to start!"
    kill $WEB_PID 2>/dev/null || true
    kill $RAG_PID 2>/dev/null || true
    kill $CHROMA_PID 2>/dev/null || true
    exit 1
fi
cd ..

# Final status
echo
print_success "🚀 All services started successfully!"
echo "=============================================="
print_success "ChromaDB:  http://localhost:8000"
print_success "RAG API:   http://localhost:8001" 
print_success "Web App:   http://localhost:${WEB_PORT}"
echo
print_status "Process IDs:"
echo "  ChromaDB: $CHROMA_PID"
echo "  RAG API:  $RAG_PID"
echo "  Web App:  $WEB_PID"
echo
print_warning "To stop all services, run: npm run stop:all"
print_status "Ready to test! Try visiting http://localhost:${WEB_PORT}" 