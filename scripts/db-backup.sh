#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ -f .env.local ]; then
  set -a
  source .env.local
  set +a
fi

DUMP_URL="${POSTGRES_URL_NON_POOLING:-${DIRECT_URL:-${DATABASE_URL:-}}}"
if [ -z "$DUMP_URL" ]; then
  echo "No POSTGRES_URL_NON_POOLING / DIRECT_URL / DATABASE_URL found in .env.local" >&2
  exit 1
fi

PG_DUMP_BIN="pg_dump"
if [ -x /opt/homebrew/opt/libpq/bin/pg_dump ]; then
  PG_DUMP_BIN="/opt/homebrew/opt/libpq/bin/pg_dump"
fi

BACKUP_DIR="backups"
mkdir -p "$BACKUP_DIR"

TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
OUT_FILE="$BACKUP_DIR/myhub_${TIMESTAMP}.dump"

echo "Backing up database to $OUT_FILE ..."
"$PG_DUMP_BIN" "$DUMP_URL" --format=custom --no-owner --no-privileges --file="$OUT_FILE"

echo "Done: $OUT_FILE ($(du -h "$OUT_FILE" | cut -f1))"

KEEP=14
ls -1t "$BACKUP_DIR"/myhub_*.dump 2>/dev/null | tail -n +$((KEEP + 1)) | while IFS= read -r old; do
  rm -- "$old"
done
