# Multi-stage build for RevNet3 - DigitalOcean optimized
FROM node:18-alpine AS frontend-builder

# Set working directory
WORKDIR /app

# Copy frontend package files
COPY package*.json ./
COPY angular.json ./
COPY tsconfig*.json ./

# Install frontend dependencies
RUN npm ci

# Copy frontend source code
COPY src/ ./src/
COPY public/ ./public/
COPY tailwind.config.js ./
COPY karma.conf.js ./

# Build frontend for production
RUN npm run build

# Backend stage
FROM node:18-alpine AS backend-builder

# Set working directory
WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./

# Install backend dependencies
RUN npm ci

# Copy backend source code
COPY backend/src/ ./src/
COPY backend/tsconfig*.json ./
COPY backend/nest-cli.json ./

# Build backend
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install dumb-init and curl for health checks
RUN apk add --no-cache dumb-init curl

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S revnet -u 1001

# Set working directory
WORKDIR /app

# Copy built frontend
COPY --from=frontend-builder /app/dist/revnet ./public

# Copy built backend
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder /app/backend/package*.json ./backend/

# Copy environment file
COPY backend/env.example ./backend/.env

# Create startup script
RUN echo '#!/bin/sh\n\
cd /app/backend\n\
node dist/main.js &\n\
cd /app\n\
npx serve -s public -l 3000\n\
' > /app/start.sh && chmod +x /app/start.sh

# Install serve globally
RUN npm install -g serve

# Change ownership
RUN chown -R revnet:nodejs /app
USER revnet

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["/app/start.sh"]
