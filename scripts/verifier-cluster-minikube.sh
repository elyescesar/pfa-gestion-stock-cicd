#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "=== Smoke test cluster minikube ==="
kubectl rollout status deployment/api -n pfa-stock --timeout=3m
kubectl run smoke-api-minikube --rm -i --restart=Never -n pfa-stock \
  --image=curlimages/curl:8.10.1 \
  --command -- curl -sf "http://api:8000/health"
echo "In-cluster /health OK"

MINIKUBE_IP="$(minikube ip -p "${MINIKUBE_PROFILE:-pfa}" 2>/dev/null || minikube ip)"
if curl -sf --connect-timeout 5 -H "Host: api.pfa.test" "http://${MINIKUBE_IP}/health" >/dev/null; then
  echo "Ingress api.pfa.test OK"
else
  echo "Note: ajoutez ${MINIKUBE_IP} pfa.test api.pfa.test grafana.test pgadmin.test au /etc/hosts pour tester l'ingress."
fi
