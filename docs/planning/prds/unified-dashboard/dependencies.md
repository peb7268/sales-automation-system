# Unified Dashboard Dependencies

## Complete Package List with Versions

### Core Framework Dependencies

#### Next.js & React Ecosystem
```json
{
  "next": "^14.0.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "@types/react": "^18.2.0",
  "@types/react-dom": "^18.2.0",
  "typescript": "^5.3.0"
}
```

#### Build Tools & Development
```json
{
  "@vitejs/plugin-react": "^4.2.0",
  "vite": "^5.0.0",
  "turbo": "^1.11.0",
  "concurrently": "^8.2.0",
  "nodemon": "^3.0.0"
}
```

### UI Component Libraries

#### Shadcn/ui & Radix UI
```json
{
  "@radix-ui/react-accordion": "^1.1.2",
  "@radix-ui/react-alert-dialog": "^1.0.5",
  "@radix-ui/react-avatar": "^1.0.4",
  "@radix-ui/react-checkbox": "^1.0.4",
  "@radix-ui/react-dialog": "^1.0.5",
  "@radix-ui/react-dropdown-menu": "^2.0.6",
  "@radix-ui/react-label": "^2.0.2",
  "@radix-ui/react-navigation-menu": "^1.1.4",
  "@radix-ui/react-popover": "^1.0.7",
  "@radix-ui/react-progress": "^1.0.3",
  "@radix-ui/react-scroll-area": "^1.0.5",
  "@radix-ui/react-select": "^2.0.0",
  "@radix-ui/react-separator": "^1.0.3",
  "@radix-ui/react-slider": "^1.1.2",
  "@radix-ui/react-switch": "^1.0.3",
  "@radix-ui/react-tabs": "^1.0.4",
  "@radix-ui/react-toast": "^1.1.5",
  "@radix-ui/react-tooltip": "^1.0.7"
}
```

#### Styling & Icons
```json
{
  "tailwindcss": "^3.4.0",
  "tailwindcss-animate": "^1.0.7",
  "@tailwindcss/typography": "^0.5.10",
  "@tailwindcss/forms": "^0.5.7",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.1.0",
  "tailwind-merge": "^2.2.0",
  "lucide-react": "^0.300.0",
  "@heroicons/react": "^2.0.18"
}
```

### Visualization Libraries

#### Chart.js Ecosystem
```json
{
  "chart.js": "^4.4.1",
  "react-chartjs-2": "^5.2.0",
  "chartjs-adapter-date-fns": "^3.0.0",
  "chartjs-plugin-datalabels": "^2.2.0",
  "chartjs-plugin-zoom": "^2.0.1",
  "chartjs-plugin-annotation": "^3.0.1"
}
```

#### D3.js Ecosystem
```json
{
  "d3": "^7.8.5",
  "@types/d3": "^7.4.3",
  "d3-selection": "^3.0.0",
  "d3-scale": "^4.0.2",
  "d3-axis": "^3.0.0",
  "d3-shape": "^3.2.0",
  "d3-transition": "^3.0.1",
  "d3-zoom": "^3.0.0",
  "d3-geo": "^3.1.0",
  "d3-hierarchy": "^3.1.2",
  "d3-force": "^3.0.0"
}
```

#### Plotly.js
```json
{
  "plotly.js": "^2.28.0",
  "react-plotly.js": "^2.6.0",
  "@types/plotly.js": "^2.12.31"
}
```

#### ApexCharts
```json
{
  "apexcharts": "^3.45.0",
  "react-apexcharts": "^1.4.1"
}
```

### Animation Libraries

#### Framer Motion
```json
{
  "framer-motion": "^10.17.0"
}
```

#### Three.js Ecosystem
```json
{
  "three": "^0.160.0",
  "@types/three": "^0.160.0",
  "@react-three/fiber": "^8.15.0",
  "@react-three/drei": "^9.92.0",
  "@react-three/postprocessing": "^2.15.0",
  "@react-three/a11y": "^3.0.0"
}
```

#### Anime.js
```json
{
  "animejs": "^3.2.2",
  "@types/animejs": "^3.1.12"
}
```

#### Remotion
```json
{
  "@remotion/cli": "^4.0.0",
  "@remotion/bundler": "^4.0.0",
  "@remotion/renderer": "^4.0.0",
  "remotion": "^4.0.0"
}
```

### Database & Backend

#### Supabase
```json
{
  "@supabase/supabase-js": "^2.39.0",
  "@supabase/auth-helpers-nextjs": "^0.8.0",
  "@supabase/postgrest-js": "^1.9.0",
  "@supabase/storage-js": "^2.5.5",
  "@supabase/realtime-js": "^2.9.0"
}
```

#### Kafka
```json
{
  "kafkajs": "^2.2.4",
  "node-rdkafka": "^2.17.0",
  "kafka-node": "^5.0.0"
}
```

#### Redis
```json
{
  "redis": "^4.6.0",
  "@redis/client": "^1.5.0",
  "@redis/bloom": "^1.2.0",
  "@redis/graph": "^1.1.0",
  "@redis/json": "^1.0.0",
  "@redis/search": "^1.1.0",
  "@redis/time-series": "^1.0.0"
}
```

### State Management & Data Fetching

```json
{
  "zustand": "^4.4.0",
  "jotai": "^2.6.0",
  "valtio": "^1.12.0",
  "@tanstack/react-query": "^5.17.0",
  "@tanstack/react-table": "^8.11.0",
  "swr": "^2.2.0",
  "axios": "^1.6.0"
}
```

### Authentication & Security

```json
{
  "next-auth": "^4.24.0",
  "@auth0/nextjs-auth0": "^3.5.0",
  "bcryptjs": "^2.4.3",
  "@types/bcryptjs": "^2.4.6",
  "jsonwebtoken": "^9.0.0",
  "@types/jsonwebtoken": "^9.0.5",
  "passport": "^0.7.0",
  "passport-local": "^1.0.0",
  "helmet": "^7.1.0"
}
```

### Real-time Communication

```json
{
  "socket.io": "^4.6.0",
  "socket.io-client": "^4.6.0",
  "ws": "^8.16.0",
  "@types/ws": "^8.5.10"
}
```

### Background Jobs & Scheduling

```json
{
  "bull": "^4.11.0",
  "agenda": "^5.0.0",
  "node-cron": "^3.0.0",
  "bullmq": "^5.1.0"
}
```

### File Processing

```json
{
  "multer": "^1.4.5-lts.1",
  "sharp": "^0.33.0",
  "pdf-parse": "^1.1.1",
  "xlsx": "^0.18.5",
  "csv-parse": "^5.5.0",
  "csv-writer": "^1.6.0",
  "formidable": "^3.5.0"
}
```

### Date & Time Utilities

```json
{
  "date-fns": "^3.0.0",
  "dayjs": "^1.11.0",
  "moment": "^2.30.0",
  "moment-timezone": "^0.5.44"
}
```

### Validation & Schemas

```json
{
  "zod": "^3.22.0",
  "yup": "^1.3.0",
  "joi": "^17.11.0",
  "@types/joi": "^17.2.3"
}
```

### MCP Servers (Model Context Protocol)

```json
{
  "@anthropic-ai/mcp-server-filesystem": "^0.1.0",
  "@anthropic-ai/mcp-server-github": "^0.1.0",
  "@anthropic-ai/mcp-server-postgres": "^0.1.0",
  "@anthropic-ai/mcp-server-brave-search": "^0.1.0",
  "@anthropic-ai/mcp-server-memory": "^0.1.0",
  "@anthropic-ai/mcp-server-time": "^0.1.0"
}
```

### Testing Dependencies

```json
{
  "vitest": "^1.1.0",
  "@testing-library/react": "^14.1.0",
  "@testing-library/jest-dom": "^6.1.0",
  "@testing-library/user-event": "^14.5.0",
  "@storybook/react": "^7.6.0",
  "@storybook/react-vite": "^7.6.0",
  "@storybook/addon-essentials": "^7.6.0",
  "@playwright/test": "^1.40.0",
  "msw": "^2.0.0",
  "@mswjs/data": "^0.16.0"
}
```

### Development Tools

```json
{
  "eslint": "^8.56.0",
  "eslint-config-next": "^14.0.0",
  "@typescript-eslint/eslint-plugin": "^6.17.0",
  "@typescript-eslint/parser": "^6.17.0",
  "prettier": "^3.1.0",
  "husky": "^8.0.0",
  "lint-staged": "^15.2.0",
  "commitizen": "^4.3.0",
  "cz-conventional-changelog": "^3.3.0"
}
```

### Monitoring & Logging

```json
{
  "@sentry/react": "^7.91.0",
  "@sentry/node": "^7.91.0",
  "winston": "^3.11.0",
  "morgan": "^1.10.0",
  "pino": "^8.17.0",
  "pino-pretty": "^10.3.0"
}
```

### Deployment & Infrastructure

```json
{
  "pm2": "^5.3.0",
  "dotenv": "^16.3.0",
  "dotenv-cli": "^7.3.0",
  "cross-env": "^7.0.3"
}
```

## Docker Images Required

### Core Services
```bash
# PostgreSQL (Supabase)
docker pull supabase/postgres:15.1.0.117
docker pull supabase/gotrue:v2.132.3
docker pull supabase/realtime:v2.25.50
docker pull supabase/storage-api:v0.46.4
docker pull supabase/meta:v0.75.0
docker pull supabase/studio:20240101.0.0

# Kafka
docker pull confluentinc/cp-kafka:7.5.3
docker pull confluentinc/cp-zookeeper:7.5.3
docker pull confluentinc/cp-schema-registry:7.5.3
docker pull confluentinc/cp-kafka-connect:7.5.3

# Redis
docker pull redis:7.2-alpine
docker pull redis/redis-stack:latest

# Development Tools
docker pull postgres:15-alpine
docker pull nginx:alpine
docker pull node:18-alpine
```

## Installation Commands

### Quick Install Script
```bash
# Create package.json in dashboard folder
cd dashboard

# Install all dependencies at once
npm install next@14 react@18 react-dom@18 typescript@5 \
  tailwindcss@3 @tailwindcss/typography @tailwindcss/forms \
  chart.js react-chartjs-2 d3 @types/d3 \
  plotly.js react-plotly.js apexcharts react-apexcharts \
  framer-motion three @react-three/fiber @react-three/drei \
  animejs @types/animejs remotion @remotion/cli \
  @supabase/supabase-js @supabase/auth-helpers-nextjs \
  kafkajs redis socket.io socket.io-client \
  zustand @tanstack/react-query axios \
  next-auth bcryptjs jsonwebtoken \
  lucide-react class-variance-authority clsx tailwind-merge \
  date-fns zod \
  @sentry/react winston

# Install dev dependencies
npm install -D @types/react @types/react-dom \
  eslint eslint-config-next prettier \
  @testing-library/react @testing-library/jest-dom \
  vitest @playwright/test
```

### Docker Compose Setup
```bash
# Pull all required images
docker compose -f docker/docker-compose.yml pull

# Start services
docker compose -f docker/docker-compose.yml up -d
```

## Version Compatibility Matrix

| Package Group | Node.js | React | Next.js | TypeScript |
|---------------|---------|--------|---------|------------|
| Core | 18+ | 18.2+ | 14+ | 5.0+ |
| Visualization | 16+ | 17+ | 13+ | 4.5+ |
| Animation | 16+ | 18+ | 13+ | 4.5+ |
| Database | 16+ | Any | Any | 4.0+ |
| Testing | 18+ | 18+ | 14+ | 5.0+ |

## Bundle Size Considerations

### Heavy Libraries (Consider lazy loading)
- `three`: ~150KB gzipped
- `plotly.js`: ~1MB gzipped (use plotly.js-basic-dist for smaller bundle)
- `d3`: ~70KB gzipped (import only needed modules)
- `remotion`: ~200KB gzipped

### Optimization Recommendations
1. Use dynamic imports for visualization libraries
2. Tree-shake D3 modules
3. Use production builds for Three.js
4. Consider CDN for Plotly.js
5. Lazy load animation libraries

## License Considerations

### MIT Licensed (Safe for commercial use)
- Most packages listed above

### Apache 2.0 Licensed
- Kafka clients
- ApexCharts

### Special Licenses
- Remotion: Requires license for commercial use
- Some Three.js add-ons: Check individual licenses

---

**Note**: All versions are latest stable as of September 2024. Check for updates before installation.