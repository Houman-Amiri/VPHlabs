# =============================================================================
# V.I.R.A Pardazesh Hoomaan (VPHLabs.com) — Multi-Stage Production Dockerfile
# Optimized for Runflare (runflare.com) & Iranian Cloud PaaS Deployments
# =============================================================================

# Stage 1: Build React + Vite + TypeScript SPA
# Note: Runflare injects service ENV vars (including NODE_ENV=production) at
# build time; force --include=dev so TypeScript, Vite & type defs are installed.
FROM node:22-bookworm-slim AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN NPM_CONFIG_PRODUCTION=false NPM_CONFIG_OMIT="" NODE_ENV=development npm ci --include=dev
COPY client/ ./
RUN NODE_ENV=production npm run build

# Stage 2: Compile Backend Dependencies (including native better-sqlite3)
# npm_config_nodedir=/usr/local allows offline node-gyp fallback using built-in
# Node C++ headers if GitHub release downloads are throttled inside Iran.
FROM node:22-bookworm-slim AS server-builder
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
ENV npm_config_nodedir=/usr/local
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --omit=dev

# Stage 3: Minimal Production Runtime Image
# Default PORT=3000 matches Runflare's standard Docker Expose Port preset
FROM node:22-bookworm-slim AS runtime
RUN apt-get update && apt-get upgrade -y --no-install-recommends \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    SQLITE_DB_PATH=/app/storage/data/vphlabs.db \
    UPLOADS_DIR=/app/storage/uploads

WORKDIR /app

# Copy compiled server dependencies & source (including SQL migrations & seeds)
COPY --from=server-builder /app/server/node_modules ./server/node_modules
COPY server/package.json ./server/package.json
COPY server/src ./server/src

# Copy built frontend SPA + public static banners/logos
COPY --from=client-builder /app/client/dist ./client/dist
COPY client/public/banners ./client/public/banners

# Prepare persistent storage mount point (/app/storage on Runflare Disk)
RUN mkdir -p /app/storage/data /app/storage/uploads

EXPOSE 3000

CMD ["node", "server/src/index.js"]
