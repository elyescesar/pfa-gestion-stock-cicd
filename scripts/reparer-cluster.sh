#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
export KUBECONFIG="${KUBECONFIG:-$(pwd)/.kube/config}"
docker run --rm --network host -v "$(pwd)/.kube:/kube:ro" alpine/helm:3.16 uninstall pfa-stock -n pfa-stock --kubeconfig=/kube/config 2>/dev/null || true
docker run --rm --network host -v "$(pwd)/.kube:/kube:ro" bitnami/kubectl --kubeconfig=/kube/config delete namespace pfa-stock --ignore-not-found --wait=true --timeout=120s 2>/dev/null || true
for i in $(seq 1 60); do
  if ! docker run --rm --network host -v "$(pwd)/.kube:/kube:ro" bitnami/kubectl --kubeconfig=/kube/config get namespace pfa-stock 2>/dev/null; then
    break
  fi
  sleep 2
done
docker compose -f docker/compose.outils.yml run --rm terraform apply -auto-approve
