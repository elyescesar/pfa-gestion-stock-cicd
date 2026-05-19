#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [ ! -f .env ]; then
  cp .env.example .env
fi
docker compose -f docker/compose.dev.yml up --build -d --remove-orphans
./scripts/afficher-acces.sh
