#!/bin/sh
set -e
if [ "${SKIP_MIGRATIONS:-}" != "true" ]; then
  echo "[entrypoint] Running database migrations..."
  node ./node_modules/typeorm/cli.js migration:run \
    -d ./dist/infrastructure/database/config/postgres.provider.js
fi
exec "$@"
