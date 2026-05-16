#!/usr/bin/env bash
set -euo pipefail
MODE="${1:-dev}"
cd "$(dirname "$0")/.."
REUSSITE=0
ECHEC=0

ok() {
  echo "  OK  $1"
  REUSSITE=$((REUSSITE + 1))
}

ko() {
  echo "  KO  $1"
  ECHEC=$((ECHEC + 1))
}

attendre_url() {
  local url="$1"
  local max="${2:-60}"
  local i=1
  while [ "$i" -le "$max" ]; do
    if curl -sf "$url" >/dev/null 2>&1; then
      return 0
    fi
    sleep 2
    i=$((i + 1))
  done
  return 1
}

echo "=== Tests unitaires (Docker) ==="
if docker compose -f docker/compose.dev.yml run --rm --no-deps api pytest -q 2>/dev/null; then
  ok "pytest backend"
else
  ko "pytest backend"
fi
if docker run --rm -v "$(pwd)/frontend:/app" -w /app node:20-alpine sh -c "npm ci --silent && npm test -- --run" 2>/dev/null; then
  ok "vitest frontend"
else
  ko "vitest frontend"
fi

echo ""
echo "=== Vérification stack ($MODE) ==="

if [ "$MODE" = "dev" ]; then
  URL_SANTE="http://localhost:8000/health"
  URL_API="http://localhost:8000"
  URL_WEB="http://localhost:3000"
else
  URL_SANTE="http://localhost/health"
  URL_API="http://localhost"
  URL_WEB="http://localhost"
fi

if attendre_url "$URL_SANTE" 90; then
  ok "santé API $URL_SANTE"
else
  ko "santé API $URL_SANTE"
fi

REPONSE=$(curl -sf -X POST "${URL_API}/api/v1/auth/connexion" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@stock.tn","mot_de_passe":"Admin123!"}' 2>/dev/null || echo "")
if echo "$REPONSE" | grep -q jeton_acces; then
  ok "connexion admin"
else
  ko "connexion admin"
fi

JETON=$(echo "$REPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('jeton_acces',''))" 2>/dev/null || echo "")
if [ -n "$JETON" ]; then
  if curl -sf -H "Authorization: Bearer $JETON" "${URL_API}/api/v1/produits" | grep -q reference_sku; then
    ok "liste produits"
  else
    ko "liste produits"
  fi
fi

CODE_WEB=$(curl -sf -o /dev/null -w "%{http_code}" "$URL_WEB" 2>/dev/null || echo "000")
if [ "$CODE_WEB" = "200" ]; then
  ok "frontend $URL_WEB"
else
  ko "frontend $URL_WEB (HTTP $CODE_WEB)"
fi

if [ "$MODE" = "cluster" ]; then
  if [ -f .kube/config ]; then
    if docker run --rm --network host -v "$(pwd)/.kube/config:/kube/config:ro" \
      bitnami/kubectl --kubeconfig=/kube/config get pods -n pfa-stock 2>/dev/null | grep -q Running; then
      ok "pods Kubernetes pfa-stock"
    else
      ko "pods Kubernetes pfa-stock"
    fi
    if docker run --rm --network host -v "$(pwd)/.kube/config:/kube/config:ro" \
      bitnami/kubectl --kubeconfig=/kube/config get pods -n monitoring 2>/dev/null | grep -q grafana; then
      ok "stack monitoring"
    else
      ko "stack monitoring"
    fi
  else
    ko "kubeconfig .kube/config absent"
  fi
fi

echo ""
echo "=== Résultat: $REUSSITE OK, $ECHEC KO ==="
if [ "$ECHEC" -gt 0 ]; then
  exit 1
fi
