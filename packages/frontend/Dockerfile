# Build stage
FROM node:22-alpine AS builder
WORKDIR /app

# Copy root package files for workspace resolution
COPY package.json package-lock.json ./
COPY packages/core/package.json packages/core/
COPY packages/backend/package.json packages/backend/
COPY packages/frontend/package.json packages/frontend/

RUN npm ci

# Copy source
COPY tsconfig.base.json ./
COPY packages/core/ packages/core/
COPY packages/frontend/ packages/frontend/

# Build core first (frontend depends on it), then frontend
RUN npm run build --workspace=@skillclimb/core && \
    npm run build --workspace=@skillclimb/frontend

# Production stage — Caddy for static serving + reverse proxy
FROM caddy:2-alpine

COPY --from=builder /app/packages/frontend/dist/ /srv/
COPY packages/frontend/Caddyfile /etc/caddy/Caddyfile

EXPOSE 80 443
