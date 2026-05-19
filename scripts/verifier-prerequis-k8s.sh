#!/usr/bin/env bash
# Prérequis cluster minikube (optionnel — make cluster)
set -euo pipefail
manque=0
for cmd in minikube kubectl helm; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "MANQUANT: $cmd"
    manque=1
  fi
done
if ! docker info >/dev/null 2>&1; then
  echo "ERREUR: Docker requis (driver minikube)"
  manque=1
fi
if [ "$manque" -eq 1 ]; then
  exit 1
fi
echo "Prérequis K8s OK: minikube, kubectl, helm, docker"
