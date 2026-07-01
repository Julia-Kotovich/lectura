#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

# Free ports from stale dev servers
for port in 3000 3001 3002 3003; do
  lsof -ti :"$port" | xargs kill -9 2>/dev/null || true
done

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

echo "==> Starting infrastructure (Docker)..."
if command -v docker &>/dev/null; then
  docker compose up -d
else
  echo "Docker not found. Start PostgreSQL manually or install Docker Desktop."
  echo "  brew services start postgresql@14"
  echo "  Then create DB: createdb lectura  (or use docker compose)"
fi

echo "==> Waiting for Postgres on :5433..."
for i in {1..30}; do
  if (echo >/dev/tcp/localhost/5433) &>/dev/null 2>&1 || nc -z localhost 5433 &>/dev/null 2>&1; then
    break
  fi
  if (echo >/dev/tcp/localhost/5432) &>/dev/null 2>&1 || nc -z localhost 5432 &>/dev/null 2>&1; then
    echo "    Postgres on 5432 detected — update DATABASE_URL in .env if needed"
    break
  fi
  sleep 1
done

echo "==> Database migrate + seed..."
npx prisma migrate deploy
npm run db:seed

echo "==> Starting Next.js dev server (webpack + polling watcher)..."
WATCHPACK_POLLING=true npm run dev
