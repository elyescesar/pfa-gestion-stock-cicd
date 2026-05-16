#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [ ! -f .kube/config ]; then
  echo "Kubeconfig absent. Lancez: make demo-cluster"
  exit 1
fi
docker rm -f pfa-grafana-pf >/dev/null 2>&1 || true
docker run -d --name pfa-grafana-pf --restart unless-stopped --network host \
  -v "$(pwd)/.kube/config:/kube/config:ro" \
  bitnami/kubectl --kubeconfig=/kube/config \
  port-forward -n monitoring svc/kube-prometheus-stack-grafana 3001:80
sleep 2
if docker ps --format '{{.Names}}' | grep -q pfa-grafana-pf; then
  echo "Grafana port-forward actif sur http://localhost:3001"
else
  echo "Échec démarrage port-forward Grafana"
  exit 1
fi
