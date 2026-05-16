#!/usr/bin/env bash
MODE="${1:-dev}"
cd "$(dirname "$0")/.."

echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║           PFA GESTION DE STOCK — ACCÈS & IDENTIFIANTS           ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

if [ "$MODE" = "dev" ]; then
  echo "Mode: DÉVELOPPEMENT (Docker Compose)"
  echo ""
  echo "  Application (UI)     http://localhost:3000"
  echo "  API REST             http://localhost:8000"
  echo "  Documentation API    http://localhost:8000/docs"
  echo "  Métriques Prometheus http://localhost:8000/metrics"
  echo "  PostgreSQL           localhost:5432 (stock / stock / stock_db)"
  echo "  LocalStack S3        http://localhost:4566"
else
  echo "Mode: CLUSTER (kind + Terraform + Helm)"
  echo ""
  echo "  Application (UI)     http://localhost"
  echo "  API (via ingress)    http://localhost/api/v1/..."
  echo "  Documentation API    http://localhost/api/v1/docs  (si exposé)"
  echo "  Métriques API        http://localhost/api/v1/metrics (via service)"
  echo "  Grafana              http://localhost:3001"
  echo "  Dashboard API        Grafana → dossier General → « PFA Stock — API FastAPI »"
  echo "  Prometheus           kubectl port-forward -n monitoring svc/kube-prometheus-stack-prometheus 9090:9090"
  echo ""
  echo "  Kubeconfig:           export KUBECONFIG=\"$(pwd)/.kube/config\""
fi

echo ""
echo "── Comptes application ──"
echo "  Admin      admin@stock.tn          /  Admin123!"
echo "  Opérateur  operateur@stock.tn      /  Operateur123!"
echo ""

if [ "$MODE" = "cluster" ]; then
  echo "── Grafana (monitoring) ──"
  echo "  Utilisateur  admin"
  echo "  Mot de passe GrafanaAdmin123!"
  echo ""
  echo "  Port-forward Grafana (si pas déjà actif):"
  echo "    ./scripts/port-forward-grafana.sh"
  echo "    ou: make grafana"
fi

echo "── Arrêt ──"
echo "  make destroy"
echo ""
