#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [ ! -f .kube/config ]; then
  echo "Kubeconfig introuvable. Lancez d'abord: make cluster"
  exit 1
fi
echo "Grafana: http://localhost:3001"
echo "Utilisateur: admin"
echo "Mot de passe: GrafanaAdmin123!"
docker run --rm -it --network host \
  -v "$(pwd)/.kube/config:/kube/config:ro" \
  bitnami/kubectl --kubeconfig=/kube/config \
  port-forward -n monitoring svc/kube-prometheus-stack-grafana 3001:80
