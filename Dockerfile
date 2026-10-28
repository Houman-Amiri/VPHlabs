# =============================================================================
# V.I.R.A Pardazesh Hoomaan (VPHLabs.com) — Multi-Stage Production Dockerfile
# Optimized for Runflare (runflare.com) & Iranian Cloud PaaS Deployments
# =============================================================================

# Stage 1: Build React + Vite + TypeScript SPA
FROM node:22-bookworm-slim AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Compile Backend Dependencies (including native better-sqlite3)
FROM node:22-bookworm-slim AS server-builder
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --omit=dev

# Stage 3: Minimal Production Runtime Image
FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=4000 \
    SQLITE_DB_PATH=/app/storage/data/vphlabs.db \
    UPLOADS_DIR=/app/storage/uploads

WORKDIR /app

# Copy compiled server dependencies & source
COPY --from=server-builder /app/server/node_modules ./server/node_modules
COPY server/package*.json ./server/
COPY server/src ./server/src

# Copy built frontend SPA + public static banners/logos
COPY --from=client-builder /app/client/dist ./client/dist
COPY client/public/banners ./client/public/banners

# Prepare persistent storage mount point (/app/storage on Runflare Disk)
RUN mkdir -p /app/storage/data /app/storage/uploads

EXPOSE 4000

CMD ["node", "server/src/index.js"]
