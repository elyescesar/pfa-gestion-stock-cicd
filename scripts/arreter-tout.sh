#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
docker compose -f docker/compose.dev.yml down -v 2>/dev/null || true
docker compose -f docker/compose.outils.yml down 2>/dev/null || true
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock kindest/node kind delete cluster --name pfa-stock 2>/dev/null || true
echo "Environnement arrêté."
