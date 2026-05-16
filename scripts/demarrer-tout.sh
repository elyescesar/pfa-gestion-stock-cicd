#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
MODE="${1:-dev}"
./scripts/verifier-prerequis.sh
if [ "$MODE" = "cluster" ]; then
  ./scripts/demarrer-cluster.sh
  ./scripts/demarrer-grafana.sh
  ./scripts/verifier.sh cluster
  ./scripts/afficher-acces.sh cluster
else
  ./scripts/demarrer-dev.sh
  ./scripts/verifier.sh dev
  ./scripts/afficher-acces.sh dev
fi
