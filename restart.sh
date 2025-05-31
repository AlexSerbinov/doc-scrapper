#!/bin/bash
set -e

# Parse arguments
SERVICE_FILTER="$1"
EXCLUDE_MODE=false

# Check if we have exclusion mode (starts with !)
if [[ "$SERVICE_FILTER" == !* ]]; then
    EXCLUDE_MODE=true
    SERVICE_FILTER="${SERVICE_FILTER:1}"  # Remove the ! prefix
fi

echo "🔥 Doc Scrapper AI - Smart Restart Script"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

print_filter() {
    echo -e "${PURPLE}[FILTER]${NC} $1"
}

# Function to check if service should be processed
should_process_service() {
    local service_name="$1"
    
    if [[ -z "$SERVICE_FILTER" ]]; then
        return 0  # Process all if no filter
    fi
    
    if [[ "$EXCLUDE_MODE" == true ]]; then
        # Exclude mode: process if service is NOT the filtered one
        if [[ "$service_name" == "$SERVICE_FILTER" ]]; then
            return 1  # Skip this service
        else
            return 0  # Process this service
        fi
    else
        # Include mode: process only if service matches filter
        if [[ "$service_name" == "$SERVICE_FILTER" ]]; then
            return 0  # Process this service
        else
            return 1  # Skip this service
        fi
    fi
}

# Print filter information
if [[ -n "$SERVICE_FILTER" ]]; then
    if [[ "$EXCLUDE_MODE" == true ]]; then
        print_filter "🚫 Exclude mode: Restarting ALL services EXCEPT: $SERVICE_FILTER"
    else
        print_filter "🎯 Include mode: Restarting ONLY: $SERVICE_FILTER"
    fi
else
    print_filter "🌐 Full restart: Restarting ALL services"
fi

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

# Step 1: Kill processes for services we're restarting
echo
print_status "Step 1: Clearing ports for services to restart..."

if should_process_service "chroma"; then
    kill_port 8000 "ChromaDB"
else
    print_status "Skipping ChromaDB (port 8000) - excluded by filter"
fi

if should_process_service "rag"; then
    kill_port 8001 "RAG API"
else
    print_status "Skipping RAG API (port 8001) - excluded by filter"
fi

if should_process_service "web"; then
    kill_port 3000 "Web App"
    kill_port 3001 "Web App (fallback)"
else
    print_status "Skipping Web App (ports 3000/3001) - excluded by filter"
fi

# Also kill any node processes that might be hanging for services we're restarting
print_status "Killing hanging processes for selected services..."
if should_process_service "web"; then
    pkill -f "next dev" 2>/dev/null || true
fi
if should_process_service "chroma"; then
    pkill -f "chroma run" 2>/dev/null || true
fi
if should_process_service "rag"; then
    pkill -f "rag/server" 2>/dev/null || true
fi
sleep 2

# Step 2: Build projects for services we're restarting
echo
print_status "Step 2: Building projects for selected services..."

# Build main project if we're restarting rag
if should_process_service "rag"; then
    print_status "Building main TypeScript project..."
    if npm run build; then
        print_success "Main project built successfully"
    else
        print_error "Main project build failed!"
        exit 1
    fi
fi

# Build web app if we're restarting web
if should_process_service "web"; then
    print_status "Building web app..."
    cd web-app
    if npm run build; then
        print_success "Web app built successfully"
    else
        print_error "Web app build failed!"
        exit 1
    fi
    cd ..
fi

# Step 3: Start selected services
echo
print_status "Step 3: Starting selected services..."

# Track PIDs for final status
CHROMA_PID=""
RAG_PID=""
WEB_PID=""
WEB_PORT=""

# Start ChromaDB
if should_process_service "chroma"; then
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
else
    print_status "Skipping ChromaDB startup - excluded by filter"
fi

# Start RAG API
if should_process_service "rag"; then
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
        if [[ -n "$CHROMA_PID" ]]; then
            kill $CHROMA_PID 2>/dev/null || true
        fi
        exit 1
    fi
else
    print_status "Skipping RAG API startup - excluded by filter"
fi

# Start Web App
if should_process_service "web"; then
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
        if [[ -n "$RAG_PID" ]]; then
            kill $RAG_PID 2>/dev/null || true
        fi
        if [[ -n "$CHROMA_PID" ]]; then
            kill $CHROMA_PID 2>/dev/null || true
        fi
        exit 1
    fi
    cd ..
else
    print_status "Skipping Web App startup - excluded by filter"
fi

# Final status
echo
print_success "🚀 Selected services started successfully!"
echo "=============================================="

# Show status for all services (running or not)
echo "Service Status:"

# ChromaDB status
if curl -s http://localhost:8000/api/v1/heartbeat > /dev/null 2>&1; then
    print_success "ChromaDB:  http://localhost:8000 ✅"
    if [[ -n "$CHROMA_PID" ]]; then
        echo "           PID: $CHROMA_PID (just started)"
    else
        echo "           PID: $(lsof -ti:8000) (already running)"
    fi
else
    print_warning "ChromaDB:  ❌ Not running"
fi

# RAG API status
if curl -s http://localhost:8001 > /dev/null 2>&1; then
    print_success "RAG API:   http://localhost:8001 ✅"
    if [[ -n "$RAG_PID" ]]; then
        echo "           PID: $RAG_PID (just started)"
    else
        echo "           PID: $(lsof -ti:8001) (already running)"
    fi
else
    print_warning "RAG API:   ❌ Not running"
fi

# Web App status
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    print_success "Web App:   http://localhost:3000 ✅"
    if [[ -n "$WEB_PID" ]]; then
        echo "           PID: $WEB_PID (just started)"
    else
        echo "           PID: $(lsof -ti:3000) (already running)"
    fi
elif curl -s http://localhost:3001 > /dev/null 2>&1; then
    print_success "Web App:   http://localhost:3001 ✅"
    if [[ -n "$WEB_PID" ]]; then
        echo "           PID: $WEB_PID (just started)"
    else
        echo "           PID: $(lsof -ti:3001) (already running)"
    fi
else
    print_warning "Web App:   ❌ Not running"
fi

echo
print_warning "To stop all services, run: npm run stop:all"

# Determine best URL to visit
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    print_status "🌐 Ready to test! Try visiting http://localhost:3000"
elif curl -s http://localhost:3001 > /dev/null 2>&1; then
    print_status "🌐 Ready to test! Try visiting http://localhost:3001"
else
    print_status "🌐 Web app not running. Start it with: npm run restart:web"
fi

echo
print_status "💡 Usage examples:"
print_status "   npm run restart        - Restart all services"
print_status "   npm run restart:web    - Restart only web app"
print_status "   npm run restart:rag    - Restart only RAG API"
print_status "   npm run restart:chroma - Restart only ChromaDB"
print_status "   npm run restart:!web   - Restart all except web app"
print_status "   npm run restart:!rag   - Restart all except RAG API" 