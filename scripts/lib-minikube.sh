#!/usr/bin/env bash
# Shared minikube helpers (sourced by cluster scripts).

fix_minikube_node_dns() {
  local profile="$1"
  echo "=== DNS nœud minikube (/etc/resolv.conf → 8.8.8.8) ==="
  minikube ssh -p "$profile" \
    "sudo sh -c 'printf \"nameserver 8.8.8.8\\nnameserver 1.1.1.1\\n\" > /etc/resolv.conf'" \
    2>/dev/null || true
}

fix_minikube_dns() {
  local profile="${1:-}"
  # Arch / systemd-resolved: CoreDNS forwarding to 192.168.49.1 often fails ("server misbehaving").
  if ! kubectl get configmap coredns -n kube-system >/dev/null 2>&1; then
    [ -n "$profile" ] && fix_minikube_node_dns "$profile"
    return 0
  fi
  echo "=== CoreDNS — forwarder public (8.8.8.8) ==="
  local corefile
  corefile="$(kubectl get configmap coredns -n kube-system -o jsonpath='{.data.Corefile}')"
  if echo "$corefile" | grep -q 'forward \. 8\.8\.8\.8'; then
    echo "CoreDNS déjà configuré."
  else
    corefile="$(echo "$corefile" | sed -E 's|forward \. /etc/resolv\.conf \{|forward . 8.8.8.8 1.1.1.1 {|')"
    kubectl create configmap coredns \
      --namespace kube-system \
      --from-literal=Corefile="$corefile" \
      --dry-run=client -o yaml | kubectl apply -f -
    kubectl rollout restart deployment/coredns -n kube-system
    kubectl rollout status deployment/coredns -n kube-system --timeout=120s
  fi
  [ -n "$profile" ] && fix_minikube_node_dns "$profile"
}

use_minikube_docker() {
  eval "$(minikube docker-env -p "$1")"
}

unset_minikube_docker() {
  eval "$(minikube docker-env -p "$1" -u)" 2>/dev/null || true
}

preload_image() {
  local img="$1"
  local profile="$2"
  echo "  preload: $img"
  unset_minikube_docker "$profile"
  use_minikube_docker "$profile"
  if docker pull "$img"; then
    echo "  OK: image dans le daemon Docker minikube"
  else
    echo "  WARN: pull échoué — vérifiez la connectivité réseau"
    return 1
  fi
  unset_minikube_docker "$profile"
}

cleanup_ingress_addon() {
  local profile="$1"
  minikube addons disable ingress -p "$profile" 2>/dev/null || true
  helm uninstall ingress-nginx -n ingress-nginx 2>/dev/null || true
  kubectl delete namespace ingress-nginx --timeout=180s 2>/dev/null || true
  kubectl delete clusterrole ingress-nginx ingress-nginx-admission 2>/dev/null || true
  kubectl delete clusterrolebinding ingress-nginx ingress-nginx-admission 2>/dev/null || true
  kubectl delete validatingwebhookconfiguration ingress-nginx-admission 2>/dev/null || true
  kubectl delete ingressclass nginx 2>/dev/null || true
}

install_ingress_nginx() {
  local profile="$1"
  local root="$2"

  echo "=== Ingress NGINX (Helm, pas addon minikube) ==="
  cleanup_ingress_addon "$profile"

  helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx 2>/dev/null || true
  helm repo update ingress-nginx

  # Chart 4.11.3 → controller v1.11.3
  preload_image "registry.k8s.io/ingress-nginx/controller:v1.11.3" "$profile" || true

  helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
    --namespace ingress-nginx \
    --create-namespace \
    --version 4.11.3 \
    -f "$root/monitoring/ingress-nginx-values-minikube.yaml" \
    --set "controller.image.pullPolicy=IfNotPresent" \
    --wait --timeout 10m
}

build_app_images_minikube() {
  local profile="$1"
  local root="$2"
  echo "=== Build images (daemon Docker minikube) ==="
  use_minikube_docker "$profile"
  docker build -t pfa-stock-api:latest "$root/backend"
  docker build -t pfa-stock-web:latest \
    --build-arg VITE_API_URL=http://api.pfa.test \
    "$root/frontend"
  unset_minikube_docker "$profile"
}
