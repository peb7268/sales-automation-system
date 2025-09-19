# Pre-Flight Setup Checklist

## Complete Setup Guide for Offline Development During Your Flight

### ✈️ Pre-Flight Downloads Checklist

#### 1. Core Dependencies Installation
```bash
# Navigate to sales project
cd /Users/pbarrick/Desktop/dev/MHM/projects/sales

# Create dashboard folder
mkdir -p dashboard
cd dashboard

# Initialize Next.js project with TypeScript
npx create-next-app@latest . --typescript --tailwind --app --src-dir=false --import-alias="@/*"
```

#### 2. Essential NPM Packages - MUST INSTALL BEFORE FLIGHT
```bash
# Core Framework & UI (Required)
npm install next@14 react@18 react-dom@18 typescript@5 \
  tailwindcss@3 @tailwindcss/typography @tailwindcss/forms \
  lucide-react class-variance-authority clsx tailwind-merge

# State Management & Data Fetching (Required)
npm install zustand @tanstack/react-query axios swr

# Database & Real-time (Critical)
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs

# All Chart Libraries (Download all for offline access)
npm install chart.js react-chartjs-2 chartjs-adapter-date-fns \
  d3 @types/d3 plotly.js react-plotly.js \
  apexcharts react-apexcharts

# Animation Libraries (All requested)
npm install framer-motion \
  three @types/three @react-three/fiber @react-three/drei \
  animejs @types/animejs \
  remotion @remotion/cli @remotion/bundler

# Kafka & Event Streaming
npm install kafkajs node-rdkafka kafka-node

# WebSocket & Real-time
npm install socket.io socket.io-client ws @types/ws

# Authentication & Security
npm install next-auth bcryptjs jsonwebtoken

# Component Libraries
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu \
  @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-tooltip

# Development Dependencies
npm install -D @types/react @types/react-dom @types/node \
  eslint eslint-config-next prettier \
  @testing-library/react vitest
```

#### 3. Docker Images - PULL BEFORE FLIGHT
```bash
# PostgreSQL/Supabase
docker pull supabase/postgres:15.1.0.117
docker pull supabase/gotrue:v2.132.3
docker pull supabase/realtime:v2.25.50
docker pull supabase/storage-api:v0.46.4
docker pull supabase/studio:20240101.0.0

# Kafka ecosystem
docker pull confluentinc/cp-kafka:7.5.3
docker pull confluentinc/cp-zookeeper:7.5.3
docker pull confluentinc/cp-schema-registry:7.5.3

# Redis
docker pull redis:7.2-alpine
docker pull redis/redis-stack:latest

# Node & Nginx
docker pull node:18-alpine
docker pull nginx:alpine

# PostgreSQL standard
docker pull postgres:15-alpine
```

#### 4. Shadcn/ui Components Setup
```bash
# Initialize Shadcn/ui (requires internet)
npx shadcn-ui@latest init

# Add all components you might need
npx shadcn-ui@latest add accordion alert-dialog avatar \
  button card checkbox dialog dropdown-menu form \
  input label navigation-menu popover progress \
  scroll-area select separator sheet skeleton \
  slider switch table tabs textarea toast tooltip
```

#### 5. Create Docker Compose Configuration
```bash
# Create docker directory
cd /Users/pbarrick/Desktop/dev/MHM/projects/sales
mkdir -p docker

# Create docker-compose.yml
cat > docker/docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: supabase/postgres:15.1.0.117
    ports:
      - "5432:5432"
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: sales_dashboard
    volumes:
      - postgres_data:/var/lib/postgresql/data

  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.3
    ports:
      - "2181:2181"
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000

  kafka:
    image: confluentinc/cp-kafka:7.5.3
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
      - "29092:29092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:29092,PLAINTEXT_HOST://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1

  redis:
    image: redis:7.2-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
EOF

# Start all containers to verify they work
docker compose -f docker/docker-compose.yml up -d

# Stop them for the flight
docker compose -f docker/docker-compose.yml down
```

#### 6. MCP Servers Installation
```bash
# Install MCP servers globally for Claude integration
npm install -g @anthropic-ai/mcp-server-filesystem \
  @anthropic-ai/mcp-server-github \
  @anthropic-ai/mcp-server-postgres \
  @anthropic-ai/mcp-server-memory
```

#### 7. Additional Development Tools
```bash
# Global tools that might be useful
npm install -g pnpm turbo concurrently pm2 nodemon

# Database tools
npm install -g prisma @prisma/client drizzle-orm drizzle-kit

# Additional utilities
npm install -g serve http-server json-server
```

### 📁 Project Structure Setup

Create the complete folder structure before your flight:

```bash
cd /Users/pbarrick/Desktop/dev/MHM/projects/sales/dashboard

# Create all directories
mkdir -p app/{(auth),dashboard/{pipeline,caller,analytics},api}
mkdir -p components/{ui,charts,animations,pipeline,caller,shared}
mkdir -p lib/{supabase,kafka,redis,utils}
mkdir -p hooks stores types public/{images,fonts}
mkdir -p styles config tests docs
```

### 📝 Essential Configuration Files

#### 1. Create `dashboard/package.json`
```json
{
  "name": "sales-dashboard",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "docker:up": "docker compose -f ../docker/docker-compose.yml up -d",
    "docker:down": "docker compose -f ../docker/docker-compose.yml down"
  }
}
```

#### 2. Create `dashboard/tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

#### 3. Create `dashboard/.env.local`
```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sales_dashboard"
NEXT_PUBLIC_SUPABASE_URL="http://localhost:54321"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Kafka
KAFKA_BROKERS="localhost:9092"
KAFKA_CLIENT_ID="dashboard-consumer"

# Redis
REDIS_URL="redis://localhost:6379"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-secret-key"

# API Keys (add your actual keys)
OPENAI_API_KEY=""
ANTHROPIC_API_KEY=""
```

### 🔥 Quick Start Commands for the Flight

```bash
# 1. Start Docker containers
cd /Users/pbarrick/Desktop/dev/MHM/projects/sales
docker compose -f docker/docker-compose.yml up -d

# 2. Start dashboard development server
cd dashboard
npm run dev

# 3. In another terminal, start existing pipeline
cd ../pipeline
npm run dev

# 4. In another terminal, start existing caller
cd ../caller
npm run dev
```

### 📚 Documentation to Download for Offline Reading

```bash
# Create docs folder
mkdir -p /Users/pbarrick/Desktop/dev/MHM/projects/sales/dashboard/docs/offline

# Download key documentation as PDFs or save as HTML
# Visit these URLs and save for offline:
```

1. **Next.js Documentation**: https://nextjs.org/docs
2. **React Documentation**: https://react.dev
3. **Tailwind CSS**: https://tailwindcss.com/docs
4. **Chart.js**: https://www.chartjs.org/docs
5. **D3.js**: https://d3js.org
6. **Three.js**: https://threejs.org/docs
7. **Framer Motion**: https://www.framer.com/motion
8. **Supabase**: https://supabase.com/docs
9. **Kafka.js**: https://kafka.js.org

### ✅ Final Pre-Flight Verification

Run this verification script to ensure everything is ready:

```bash
# Create verification script
cat > /Users/pbarrick/Desktop/dev/MHM/projects/sales/verify-setup.sh << 'EOF'
#!/bin/bash

echo "🔍 Verifying Pre-Flight Setup..."

# Check Node.js
echo -n "Node.js: "
node --version

# Check npm packages
echo -n "Next.js: "
npm list next 2>/dev/null | grep next@ | head -1

echo -n "React: "
npm list react 2>/dev/null | grep react@ | head -1

# Check Docker images
echo "Docker Images:"
docker images | grep -E "(supabase|kafka|redis|postgres|node|nginx)" | wc -l
echo "images found"

# Check Docker Compose
echo -n "Docker Compose: "
docker compose version

# Check if containers can start
echo "Testing container startup..."
cd /Users/pbarrick/Desktop/dev/MHM/projects/sales
docker compose -f docker/docker-compose.yml up -d
sleep 5
docker ps --format "table {{.Names}}\t{{.Status}}"
docker compose -f docker/docker-compose.yml down

echo "✅ Setup verification complete!"
EOF

chmod +x /Users/pbarrick/Desktop/dev/MHM/projects/sales/verify-setup.sh
./verify-setup.sh
```

### 🎯 What You Can Build During Your Flight

With this setup, you can:

1. **Build the complete dashboard UI** with all tabs
2. **Create all visualization components** with Chart.js, D3, Plotly
3. **Implement animations** with Framer Motion and Three.js
4. **Set up real-time data flow** with Kafka and WebSockets
5. **Design and implement the database schema** in Supabase
6. **Create the authentication system** with NextAuth
7. **Build reusable component library** with Shadcn/ui
8. **Develop offline-first features** with local storage
9. **Write comprehensive tests** with Vitest
10. **Create documentation** for the new system

### 🚨 Troubleshooting During Flight

If something doesn't work:

1. **npm packages missing**: Check `node_modules/` - all should be there
2. **Docker won't start**: Containers are already downloaded, just need `docker compose up`
3. **Port conflicts**: Change ports in docker-compose.yml
4. **Database connection**: Use local PostgreSQL from Docker
5. **Missing types**: TypeScript definitions are included in packages

### 📋 Final Checklist

Before boarding your flight, verify:

- [ ] All npm packages installed in `dashboard/node_modules`
- [ ] All Docker images pulled and visible in `docker images`
- [ ] Project structure created
- [ ] Configuration files in place
- [ ] Verification script runs successfully
- [ ] Development servers can start
- [ ] Docker containers can start and stop

---

**Safe travels! Everything is set up for productive development at 30,000 feet! ✈️**