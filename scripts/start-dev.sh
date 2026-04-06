#!/usr/bin/env bash
# Libera a porta do API (evita EADDRINUSE) e sobe o Nest em modo watch.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PORT="${PORT:-3000}"
echo "[dev] Liberando porta ${PORT} (se estiver em uso)..."

free_port() {
  local p="$1"
  if command -v lsof >/dev/null 2>&1; then
    local pids
    pids="$(lsof -ti:"$p" -sTCP:LISTEN 2>/dev/null || true)"
    if [ -n "${pids}" ]; then
      # shellcheck disable=SC2086
      kill -9 ${pids} 2>/dev/null || true
      return 0
    fi
  fi
  if command -v fuser >/dev/null 2>&1; then
    fuser -k "${p}/tcp" 2>/dev/null || true
  fi
}

free_port "$PORT"
sleep 0.4

echo "[dev] Iniciando Nest (watch)..."
exec npm run start:dev
