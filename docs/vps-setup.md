# Déploiement production optionnel (VPS k3s)

> **Hors périmètre soutenance.** La validation PFA repose sur `make dev`, `make cluster` (minikube) et la CI GitHub Actions — voir [demo-soutenance.md](demo-soutenance.md).

Ce guide décrit un **VPS dédié** avec k3s (sans Coolify). Prérequis : VPS ≥ 4 Go RAM (8 Go recommandé), domaine configuré en DNS A vers l’IP publique.

## 1. k3s sur le VPS

```bash
curl -sfL https://get.k3s.io | sh -s - - --disable traefik
sudo cp /etc/rancher/k3s/k3s.yaml ~/k3s.yaml
sed -i "s/127.0.0.1/<IP_PUBLIQUE_VPS>/" ~/k3s.yaml
export KUBECONFIG=~/k3s.yaml
kubectl get nodes
```

Secret GitHub `KUBECONFIG` : `base64 -w0 ~/k3s.yaml` (Linux).

## 2. DNS

Enregistrements A vers l’IP du VPS :

| Host | Usage |
|------|--------|
| `pfa.elyes.dev` | Frontend |
| `api.pfa.elyes.dev` | API |
| `grafana.pfa.elyes.dev` | Grafana |
| `pgadmin.pfa.elyes.dev` | pgAdmin |
| `dashboard.pfa.elyes.dev` | Dashboard K8s |

Adapter les noms dans `infrastructure/terraform/variables.tf` et `helm/pfa-stock/values-prod.yaml` si besoin.

## 3. Plateforme (Terraform, une fois)

```bash
cd infrastructure/terraform
terraform init
terraform apply \
  -var="grafana_admin_password=..." \
  -var="pgadmin_password=..." \
  -var="postgres_password=..."
```

Installe : ingress-nginx (LoadBalancer), cert-manager (Let's Encrypt), kube-prometheus-stack, pgAdmin, dashboard Kubernetes.

## 4. Application (manuel)

Workflow GitHub **Deploy PFA Stock** (`workflow_dispatch`) :

- Build et push images vers GHCR
- `helm upgrade` avec `values-prod.yaml`
- Smoke test in-cluster `/health`

Secrets requis : `KUBECONFIG`, `SECRET_JWT`, `POSTGRES_PASSWORD`, `GHCR_PAT` (si images privées).

## 5. Vérification

```bash
kubectl get pods -A
curl -sf https://api.pfa.elyes.dev/health
```

Pour la démo et le jury, utiliser **minikube en local** — pas ce VPS.
