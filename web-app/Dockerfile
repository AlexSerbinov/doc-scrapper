# Web App (Next.js) Dockerfile
FROM node:18-alpine AS base

# Install system dependencies
RUN apk add --no-cache libc6-compat curl

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package*.json ./
RUN npm ci && npm cache clean --force

# Development dependencies stage
FROM base AS deps
COPY package*.json ./
RUN npm ci

# Builder stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED 1

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install system dependencies and curl for health checks
RUN apk add --no-cache libc6-compat curl

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Create directories with proper permissions
RUN mkdir -p /app/scraped-docs && chown -R nextjs:nodejs /app

USER nextjs

# Expose port
EXPOSE 3000

# Environment variables
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the Next.js application
CMD ["node", "server.js"] 