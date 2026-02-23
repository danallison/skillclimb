# Deployment Guide

## Prerequisites

- Docker and Docker Compose
- A `.env` file (copy from `.env.example`)

## Quick Start

```bash
cp .env.example .env
# Edit .env — at minimum set POSTGRES_PASSWORD
```

## Environment Variables

All configuration is in a single `.env` file at the project root.

| Variable | Required | Default | Description |
|----------|:--------:|---------|-------------|
| `POSTGRES_PASSWORD` | Yes | — | PostgreSQL password |
| `POSTGRES_DB` | No | `skillclimb` | PostgreSQL database name |
| `POSTGRES_USER` | No | `postgres` | PostgreSQL user |
| `DATABASE_URL` | No | Built from POSTGRES_* vars in Docker | PostgreSQL connection string (set automatically in Docker Compose) |
| `AI_PROVIDER` | No | `none` | AI provider: `anthropic`, `openai`, `ollama`, `none` |
| `ANTHROPIC_API_KEY` | No | — | Required if `AI_PROVIDER=anthropic` |
| `OPENAI_API_KEY` | No | — | Required if `AI_PROVIDER=openai` |
| `JWT_SECRET` | Prod | — | Required in production (min 32 chars). Auto-generates a dev secret otherwise |
| `DOMAIN` | No | `localhost` | Domain for Caddy auto-HTTPS |

## Deploying

### 1. Start the database

```bash
docker compose up -d postgres
```

Wait for it to be healthy:

```bash
docker compose ps
```

### 2. Run migrations

Migrations are **not** run automatically on server start. Run them explicitly:

```bash
docker compose run --rm backend node dist/db/migrate.js
```

Review the output. If something goes wrong, the server hasn't started yet so there's no impact on users.

To opt into auto-migration on container start (convenient for dev, not recommended for production), set `RUN_MIGRATIONS=true`:

```bash
# In docker-compose.yml or .env:
RUN_MIGRATIONS=true
```

### 3. Seed content (first deploy only)

```bash
docker compose run --rm backend node dist/db/seed.js
```

Seeding is idempotent — safe to re-run. New content is added, existing content is updated, and removed content is retired (not deleted).

### 4. Start the application

```bash
docker compose up -d backend frontend
```

Or start everything at once:

```bash
docker compose up -d
```

The backend serves on port 3001. The frontend serves on ports 80/443 with Caddy handling TLS when `DOMAIN` is set to a real domain.

## Updating

### Routine updates (no migration)

```bash
docker compose pull
docker compose up -d backend frontend
```

### Updates with migrations

```bash
# Pull new images
docker compose pull

# Run migrations before starting the new version
docker compose run --rm backend node dist/db/migrate.js

# Review output, then start
docker compose up -d backend frontend
```

### High-risk migrations

For schema changes that could lose data or take a long time:

1. **Back up the database first** (substitute your `POSTGRES_USER` and `POSTGRES_DB` if changed from defaults):
   ```bash
   docker compose exec postgres pg_dump -U postgres skillclimb > backup.sql
   ```

2. **Run the migration:**
   ```bash
   docker compose run --rm backend node dist/db/migrate.js
   ```

3. **Verify the migration worked** (connect and spot-check):
   ```bash
   docker compose exec postgres psql -U postgres skillclimb
   ```

4. **If something went wrong**, restore from backup:
   ```bash
   docker compose exec -T postgres psql -U postgres skillclimb < backup.sql
   ```

5. **Start the server** once you're satisfied:
   ```bash
   docker compose up -d backend frontend
   ```

## Rollback

Drizzle ORM does not generate rollback migrations. To undo a migration:

1. Restore from a database backup (see above), or
2. Write a new migration that reverses the changes:
   ```bash
   # On your dev machine, modify the schema and generate a new migration
   cd packages/backend
   DATABASE_URL="..." npx drizzle-kit generate
   ```

## Using Pre-built Images

CI pushes images to GitHub Container Registry on every merge to main:

- `ghcr.io/danallison/skillclimb-backend:latest`
- `ghcr.io/danallison/skillclimb-frontend:latest`

Images are also tagged with the git SHA for pinning to a specific version.

To use pre-built images instead of building locally:

```bash
docker compose pull
docker compose up -d
```

To build locally instead:

```bash
docker compose up -d --build
```
