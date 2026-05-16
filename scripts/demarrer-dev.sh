#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [ ! -f .env ]; then
  cp .env.example .env
fi
docker compose -f docker/compose.dev.yml up --build -d
sleep 5
./scripts/init-localstack.sh || true
echo "Application disponible:"
echo "  Frontend: http://localhost:3000"
echo "  API:      http://localhost:8000/docs"
echo "  Postgres: localhost:5432"
