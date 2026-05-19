#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
docker compose -f docker/compose.dev.yml down -v --remove-orphans 2>/dev/null || true
echo "Environnement arrêté."
