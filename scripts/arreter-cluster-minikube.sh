#!/usr/bin/env bash
set -euo pipefail
MINIKUBE_PROFILE="${MINIKUBE_PROFILE:-pfa}"

if minikube status -p "$MINIKUBE_PROFILE" >/dev/null 2>&1; then
  minikube stop -p "$MINIKUBE_PROFILE" || true
  echo "Cluster minikube arrêté (profil ${MINIKUBE_PROFILE})."
  echo "Suppression complète: minikube delete -p ${MINIKUBE_PROFILE}"
else
  echo "Aucun cluster actif pour le profil ${MINIKUBE_PROFILE}."
fi
