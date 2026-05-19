#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
# shellcheck source=lib-minikube.sh
source "$(dirname "$0")/lib-minikube.sh"

MINIKUBE_PROFILE="${MINIKUBE_PROFILE:-pfa}"
MINIKUBE_MEM="${MINIKUBE_MEM:-4096}"
MINIKUBE_CPUS="${MINIKUBE_CPUS:-2}"
WITH_PGADMIN="${WITH_PGADMIN:-true}"
ROOT="$(pwd)"

echo "=== Cluster minikube (profil: ${MINIKUBE_PROFILE}) ==="

if ! command -v minikube >/dev/null 2>&1; then
  echo "Installez minikube: https://minikube.sigs.k8s.io/docs/start/"
  exit 1
fi

if ! minikube status -p "$MINIKUBE_PROFILE" >/dev/null 2>&1; then
  minikube start -p "$MINIKUBE_PROFILE" \
    --driver=docker \
    --cpus="$MINIKUBE_CPUS" \
    --memory="$MINIKUBE_MEM" \
    --kubernetes-version=stable \
    --dns-proxy=false \
    --extra-config=kubelet.resolv-conf=/etc/resolv.conf
else
  echo "Minikube déjà démarré."
fi

fix_minikube_dns "$MINIKUBE_PROFILE"
install_ingress_nginx "$MINIKUBE_PROFILE" "$ROOT"
minikube addons enable metrics-server -p "$MINIKUBE_PROFILE" 2>/dev/null || echo "metrics-server optionnel — ignoré"

build_app_images_minikube "$MINIKUBE_PROFILE" "$ROOT"

echo "=== Helm repos ==="
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts 2>/dev/null || true
helm repo add runix https://helm.runix.net 2>/dev/null || true
helm repo update

echo "=== Monitoring (kube-prometheus-stack) ==="
helm upgrade --install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --version 65.5.0 \
  -f "$ROOT/monitoring/kube-prometheus-values.yaml" \
  -f "$ROOT/monitoring/kube-prometheus-values-minikube.yaml" \
  --set grafana.adminPassword=GrafanaAdmin123! \
  --wait --timeout 15m

kubectl create configmap grafana-dashboard-pfa-stock-api \
  --namespace monitoring \
  --from-file=pfa-stock-api.json="$ROOT/monitoring/dashboards/pfa-stock-api.json" \
  --dry-run=client -o yaml | kubectl apply -f -
kubectl label configmap grafana-dashboard-pfa-stock-api \
  --namespace monitoring grafana_dashboard=1 --overwrite

echo "=== Kubernetes Dashboard ==="
helm upgrade --install kubernetes-dashboard \
  "https://github.com/kubernetes-retired/dashboard/releases/download/kubernetes-dashboard-7.14.0/kubernetes-dashboard-7.14.0.tgz" \
  --namespace kubernetes-dashboard \
  --create-namespace \
  -f "$ROOT/monitoring/kubernetes-dashboard-values-minikube.yaml" \
  --wait --timeout 10m

if [ "$WITH_PGADMIN" != "false" ]; then
  echo "=== pgAdmin ==="
  helm upgrade --install pgadmin runix/pgadmin4 \
    --namespace pgadmin \
    --create-namespace \
    --version 1.29.0 \
    --set env.email=admin@pfa.test \
    --set env.password=PgAdmin123! \
    --set ingress.enabled=true \
    --set ingress.ingressClassName=nginx \
    --set "ingress.hosts[0].host=pgadmin.test" \
    --set "ingress.hosts[0].paths[0].path=/" \
    --set "ingress.hosts[0].paths[0].pathType=Prefix" \
    --wait --timeout 8m
fi

echo "=== Application (pfa-stock) ==="
helm upgrade --install pfa-stock "$ROOT/helm/pfa-stock" \
  --namespace pfa-stock \
  --create-namespace \
  -f "$ROOT/helm/pfa-stock/values-minikube.yaml" \
  --wait --timeout 10m

MINIKUBE_IP="$(minikube ip -p "$MINIKUBE_PROFILE")"
echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║              MINIKUBE — ACCÈS (ajouter au /etc/hosts)             ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
echo "  ${MINIKUBE_IP}  pfa.test api.pfa.test grafana.test pgadmin.test"
echo ""
echo "  Application     http://pfa.test"
echo "  API             http://api.pfa.test/health"
echo "  Grafana         http://grafana.test  (admin / GrafanaAdmin123!)"
if [ "$WITH_PGADMIN" != "false" ]; then
  echo "  pgAdmin         http://pgadmin.test  (admin@pfa.test / PgAdmin123!)"
fi
echo ""
echo "  Dashboard K8s (port-forward, autre terminal) :"
echo "    kubectl -n kubernetes-dashboard port-forward svc/kubernetes-dashboard-kong-proxy 8443:443"
echo "    https://localhost:8443  (token ci-dessous)"
echo ""
echo "  Token dashboard admin (24h) :"
kubectl -n kubernetes-dashboard create token dashboard-admin 2>/dev/null \
  || kubectl -n kubernetes-dashboard create token kubernetes-dashboard 2>/dev/null \
  || echo "    kubectl -n kubernetes-dashboard create token <serviceaccount>"
echo ""
echo "  Ou: minikube dashboard -p ${MINIKUBE_PROFILE}"
echo ""
echo "  Arrêt: make cluster-down"
