#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
./scripts/verifier-prerequis.sh
./scripts/demarrer-dev.sh
./scripts/verifier.sh dev
./scripts/afficher-acces.sh
