# WebSocket Server Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies for WebSocket server
COPY package*.json ./
RUN npm ci --only=production

# Copy WebSocket server source
COPY src/infrastructure/websocket-server.ts ./src/infrastructure/
COPY src/utils/ ./src/utils/
COPY tsconfig.json ./

# Install TypeScript for compilation
RUN npm install -g typescript tsx

# Compile TypeScript
RUN tsc

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S websocket -u 1001

# Create logs directory
RUN mkdir -p /app/logs && chown -R websocket:nodejs /app/logs

USER websocket

EXPOSE 8080

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["node", "dist/infrastructure/websocket-server.js"]