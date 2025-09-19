#!/bin/bash

echo "🔍 Verifying Pre-Flight Setup..."
echo "================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Check Node.js
echo -n "Node.js: "
if command -v node &> /dev/null; then
    echo -e "${GREEN}$(node --version)${NC}"
else
    echo -e "${RED}Not installed${NC}"
fi

# Check npm
echo -n "npm: "
if command -v npm &> /dev/null; then
    echo -e "${GREEN}$(npm --version)${NC}"
else
    echo -e "${RED}Not installed${NC}"
fi

# Check Docker
echo -n "Docker: "
if command -v docker &> /dev/null; then
    echo -e "${GREEN}$(docker --version | cut -d' ' -f3 | tr -d ',')${NC}"
else
    echo -e "${RED}Not installed${NC}"
fi

# Check Docker Compose
echo -n "Docker Compose: "
if command -v docker &> /dev/null && docker compose version &> /dev/null; then
    echo -e "${GREEN}$(docker compose version | cut -d' ' -f4)${NC}"
else
    echo -e "${RED}Not installed${NC}"
fi

echo ""
echo "📦 Checking npm packages in dashboard..."
cd /Users/pbarrick/Desktop/dev/MHM/projects/sales/dashboard

# Check key packages
packages=("next" "react" "typescript" "tailwindcss" "chart.js" "d3" "plotly.js" "framer-motion" "three" "@supabase/supabase-js" "kafkajs" "redis")

for package in "${packages[@]}"; do
    if npm list "$package" --depth=0 &> /dev/null; then
        version=$(npm list "$package" --depth=0 2>/dev/null | grep "$package@" | head -1 | sed "s/.*$package@//" | cut -d' ' -f1)
        echo -e "✅ $package: ${GREEN}$version${NC}"
    else
        echo -e "❌ $package: ${RED}Not installed${NC}"
    fi
done

echo ""
echo "🐳 Docker Images:"
echo "----------------"

# Check Docker images
images=(
    "supabase/postgres:15.1.0.117"
    "confluentinc/cp-kafka:7.5.3"
    "confluentinc/cp-zookeeper:7.5.3"
    "redis:7.2-alpine"
    "node:18-alpine"
    "postgres:15-alpine"
)

for image in "${images[@]}"; do
    if docker images | grep -q "$(echo $image | cut -d: -f1).*$(echo $image | cut -d: -f2)"; then
        echo -e "✅ $image"
    else
        echo -e "⏳ $image (pulling or missing)"
    fi
done

total_images=$(docker images | grep -E "(supabase|kafka|redis|postgres|node|nginx|zookeeper)" | wc -l)
echo -e "\nTotal relevant images found: ${GREEN}$total_images${NC}"

echo ""
echo "🚀 Testing container startup..."
cd /Users/pbarrick/Desktop/dev/MHM/projects/sales

if [ -f docker/docker-compose.yml ]; then
    echo "Starting containers..."
    docker compose -f docker/docker-compose.yml up -d 2>/dev/null
    
    sleep 5
    
    echo ""
    echo "Container Status:"
    docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "(postgres|kafka|zookeeper|redis)" || echo "No containers running"
    
    echo ""
    echo "Stopping containers..."
    docker compose -f docker/docker-compose.yml down 2>/dev/null
else
    echo -e "${YELLOW}Docker Compose file not found${NC}"
fi

echo ""
echo "📁 Directory Structure:"
if [ -d /Users/pbarrick/Desktop/dev/MHM/projects/sales/dashboard ]; then
    echo -e "${GREEN}✅ Dashboard directory exists${NC}"
    
    # Check key directories
    dirs=("app" "components" "lib" "hooks" "stores" "types" "public")
    for dir in "${dirs[@]}"; do
        if [ -d "/Users/pbarrick/Desktop/dev/MHM/projects/sales/dashboard/$dir" ]; then
            echo -e "  ✅ $dir/"
        else
            echo -e "  ❌ $dir/ missing"
        fi
    done
else
    echo -e "${RED}Dashboard directory not found${NC}"
fi

echo ""
echo "📄 Configuration Files:"
files=("package.json" "tsconfig.json" "next.config.js" "tailwind.config.js" ".env.local" "components.json")
for file in "${files[@]}"; do
    if [ -f "/Users/pbarrick/Desktop/dev/MHM/projects/sales/dashboard/$file" ]; then
        echo -e "✅ $file"
    else
        echo -e "❌ $file missing"
    fi
done

echo ""
echo "================================"
echo "✅ Setup verification complete!"
echo ""
echo "🎯 Quick Start Commands:"
echo "  1. Start Docker: cd /Users/pbarrick/Desktop/dev/MHM/projects/sales && docker compose -f docker/docker-compose.yml up -d"
echo "  2. Start Dashboard: cd dashboard && npm run dev"
echo "  3. Visit: http://localhost:3000"
echo ""
echo "✈️ Ready for offline development!"