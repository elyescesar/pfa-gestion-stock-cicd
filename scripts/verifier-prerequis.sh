#!/usr/bin/env bash
set -euo pipefail
manque=0
if ! command -v docker >/dev/null 2>&1; then
  echo "MANQUANT: docker"
  manque=1
fi
if ! docker compose version >/dev/null 2>&1; then
  echo "MANQUANT: docker compose (plugin Compose V2)"
  manque=1
fi
if ! docker info >/dev/null 2>&1; then
  echo "ERREUR: le démon Docker ne répond pas (démarrez Docker / Podman)"
  manque=1
fi
if [ "$manque" -eq 1 ]; then
  exit 1
fi
echo "Prérequis OK: docker + docker compose"
