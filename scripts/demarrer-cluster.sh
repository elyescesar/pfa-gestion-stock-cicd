#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [ ! -f .env ]; then
  cp .env.example .env
fi
export DOCKER_HOST="${DOCKER_HOST:-unix:///var/run/docker.sock}"
NOM_CLUSTER="pfa-stock"
echo "=== Démarrage LocalStack ==="
docker compose -f docker/compose.outils.yml up -d localstack
sleep 8
echo "=== Création cluster kind ==="
docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v "$(pwd):/work" -w /work \
  -e KIND_EXPERIMENTAL_PROVIDER="${KIND_EXPERIMENTAL_PROVIDER:-}" \
  kindest/node:latest kind delete cluster --name "$NOM_CLUSTER" 2>/dev/null || true
docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v "$(pwd):/work" -w /work \
  -e KIND_EXPERIMENTAL_PROVIDER="${KIND_EXPERIMENTAL_PROVIDER:-}" \
  kindest/node:latest kind create cluster --name "$NOM_CLUSTER" --config infrastructure/kubernetes/kind/cluster-config.yaml
echo "=== Build images ==="
docker build -t pfa-stock-api:latest backend
docker build -t pfa-stock-web:latest --build-arg VITE_API_URL=http://localhost frontend
mkdir -p .kube
docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v "$(pwd)/.kube:/root/.kube" \
  kindest/node:latest kind export kubeconfig --name "$NOM_CLUSTER" --kubeconfig /root/.kube/config
echo "=== Chargement images dans kind ==="
docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v "$(pwd)/.kube:/root/.kube" \
  kindest/node:latest kind load docker-image pfa-stock-api:latest --name "$NOM_CLUSTER"
docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v "$(pwd)/.kube:/root/.kube" \
  kindest/node:latest kind load docker-image pfa-stock-web:latest --name "$NOM_CLUSTER"
echo "=== Terraform apply ==="
docker compose -f docker/compose.outils.yml run --rm terraform init
docker compose -f docker/compose.outils.yml run --rm terraform apply -auto-approve
echo "=== Cluster prêt ==="
echo "Grafana: kubectl port-forward -n monitoring svc/kube-prometheus-stack-grafana 3001:80"
echo "App:     http://localhost (ingress)"
