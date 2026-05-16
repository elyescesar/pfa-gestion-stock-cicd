#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
docker rm -f pfa-grafana-pf 2>/dev/null || true
docker compose -f docker/compose.dev.yml down -v 2>/dev/null || true
docker compose -f docker/compose.outils.yml down 2>/dev/null || true
./scripts/kind-docker.sh delete cluster --name pfa-stock 2>/dev/null || true
echo "Environnement arrêté."
