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
COPY packages/backend/ packages/backend/

# Build core first (backend depends on it), then backend
RUN npm run build --workspace=@skillclimb/core && \
    npm run build --workspace=@skillclimb/backend

# Production stage
FROM node:22-alpine
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/core/package.json packages/core/
COPY packages/backend/package.json packages/backend/
COPY packages/frontend/package.json packages/frontend/

RUN npm ci --omit=dev

# Copy compiled output
COPY --from=builder /app/packages/core/dist/ packages/core/dist/
COPY --from=builder /app/packages/backend/dist/ packages/backend/dist/

# Copy migrations
COPY packages/backend/drizzle/ packages/backend/drizzle/

# Copy skill tree content (YAML files needed at runtime for seeding)
# seed.js resolves content relative to dist/, so content must be at dist/content/
COPY packages/backend/src/content/ packages/backend/dist/content/

# Copy entrypoint
COPY packages/backend/entrypoint.sh packages/backend/

WORKDIR /app/packages/backend

ENV NODE_ENV=production
EXPOSE 3001

ENTRYPOINT ["sh", "entrypoint.sh"]
