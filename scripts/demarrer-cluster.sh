#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [ ! -f .env ]; then
  cp .env.example .env
fi
export DOCKER_HOST="${DOCKER_HOST:-unix:///var/run/docker.sock}"
NOM_CLUSTER="pfa-stock"
KIND="./scripts/kind-docker.sh"
echo "=== Démarrage LocalStack ==="
docker compose -f docker/compose.outils.yml up -d localstack
sleep 8
echo "=== Création cluster kind ==="
$KIND delete cluster --name "$NOM_CLUSTER" 2>/dev/null || true
$KIND create cluster --name "$NOM_CLUSTER" --config infrastructure/kubernetes/kind/cluster-config.yaml
echo "=== Build images ==="
docker build -t pfa-stock-api:latest backend
docker build -t pfa-stock-web:latest --build-arg VITE_API_URL=http://localhost frontend
mkdir -p .kube
$KIND export kubeconfig --name "$NOM_CLUSTER" --kubeconfig .kube/config
docker run --rm -v "$(pwd)/.kube:/kube" alpine sh -c "chmod 644 /kube/config && chown $(id -u):$(id -g) /kube/config" 2>/dev/null || true
echo "=== Chargement images dans kind ==="
$KIND load docker-image pfa-stock-api:latest --name "$NOM_CLUSTER"
$KIND load docker-image pfa-stock-web:latest --name "$NOM_CLUSTER"
echo "=== Terraform apply ==="
docker compose -f docker/compose.outils.yml run --rm terraform init -upgrade
docker compose -f docker/compose.outils.yml run --rm terraform apply -auto-approve
echo "=== Cluster prêt ==="
echo "Grafana: kubectl port-forward -n monitoring svc/kube-prometheus-stack-grafana 3001:80"
echo "App:     http://localhost"
