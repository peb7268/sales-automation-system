#!/bin/bash

# Jest Web UI Launch Script for Mile High Marketing Sales Automation
# Automatically opens Jest UI, runs tests, and manages coverage reports

set -e

echo "🧪 Starting MHM Sales Automation Test UI..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 1  # Port is in use
    else
        return 0  # Port is available
    fi
}

# Find available port for Majestic UI
MAJESTIC_PORT=4000
while ! check_port $MAJESTIC_PORT; do
    echo -e "${YELLOW}Port $MAJESTIC_PORT is busy, trying $(($MAJESTIC_PORT + 1))...${NC}"
    MAJESTIC_PORT=$(($MAJESTIC_PORT + 1))
done

echo -e "${GREEN}✅ Using port $MAJESTIC_PORT for Jest UI${NC}"

# Create log directory
mkdir -p logs

# Function to open URLs with delay
open_with_delay() {
    local url=$1
    local delay=$2
    local name=$3
    
    echo -e "${BLUE}📱 Opening $name in $delay seconds...${NC}"
    (sleep $delay && open "$url" && echo -e "${GREEN}✅ Opened $name${NC}") &
}

# Function to cleanup background processes
cleanup() {
    echo -e "\n${YELLOW}🛑 Cleaning up...${NC}"
    # Kill any background processes started by this script
    jobs -p | xargs -r kill 2>/dev/null || true
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

# Start Jest UI (Majestic)
echo -e "${BLUE}🚀 Starting Jest UI (Majestic) on port $MAJESTIC_PORT...${NC}"
npm run test:ui -- --port $MAJESTIC_PORT > logs/majestic.log 2>&1 &
MAJESTIC_PID=$!

# Wait for Majestic to start
sleep 3

# Check if Majestic started successfully
if ! kill -0 $MAJESTIC_PID 2>/dev/null; then
    echo -e "${RED}❌ Failed to start Jest UI. Check logs/majestic.log${NC}"
    exit 1
fi

# Open Jest UI
open_with_delay "http://localhost:$MAJESTIC_PORT" 2 "Jest UI"

# Run initial test coverage
echo -e "${BLUE}📊 Running initial test coverage...${NC}"
npm run test:coverage > logs/coverage.log 2>&1 &
COVERAGE_PID=$!

# Wait for coverage to complete
wait $COVERAGE_PID
COVERAGE_STATUS=$?

if [ $COVERAGE_STATUS -eq 0 ]; then
    echo -e "${GREEN}✅ Coverage report generated successfully${NC}"
    
    # Open coverage report with delay
    open_with_delay "coverage/lcov-report/index.html" 8 "Coverage Report"
    
    # Generate HTML test report
    echo -e "${BLUE}📋 Generating HTML test report...${NC}"
    npm test > logs/test-report.log 2>&1
    
    if [ -f "test-report.html" ]; then
        echo -e "${GREEN}✅ HTML test report generated${NC}"
        open_with_delay "test-report.html" 12 "Test Report"
    fi
else
    echo -e "${YELLOW}⚠️  Coverage generation had issues. Check logs/coverage.log${NC}"
fi

echo -e "${GREEN}🎉 Test environment setup complete!${NC}"
echo -e "${BLUE}📱 Available interfaces:${NC}"
echo -e "   • Jest UI (Interactive): ${YELLOW}http://localhost:$MAJESTIC_PORT${NC}"
echo -e "   • Coverage Report: ${YELLOW}coverage/lcov-report/index.html${NC}"
echo -e "   • HTML Test Report: ${YELLOW}test-report.html${NC}"
echo -e ""
echo -e "${BLUE}📝 Available commands while running:${NC}"
echo -e "   • ${YELLOW}npm run test:watch${NC} - Watch mode testing"
echo -e "   • ${YELLOW}npm run test:coverage${NC} - Update coverage"
echo -e "   • ${YELLOW}npm test${NC} - Run all tests"
echo -e ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

# Keep script running and monitor services
while true; do
    sleep 5
    
    # Check if Majestic is still running
    if ! kill -0 $MAJESTIC_PID 2>/dev/null; then
        echo -e "${RED}❌ Jest UI stopped unexpectedly${NC}"
        break
    fi
done

cleanup