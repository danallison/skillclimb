#!/bin/sh
set -e

# If arguments are passed, run them instead of the default server start.
# This enables: docker compose run --rm backend node dist/db/migrate.js
if [ $# -gt 0 ]; then
  exec "$@"
fi

if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "Running database migrations..."
  node dist/db/migrate.js
fi

echo "Starting server..."
exec node dist/index.js
