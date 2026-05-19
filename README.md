# PFA — Gestion de Stock

Application de gestion d'inventaire : backend FastAPI, frontend React, PostgreSQL.  
**Validation soutenance** : Docker Compose, GitHub Actions, minikube — voir [docs/demo-soutenance.md](docs/demo-soutenance.md).

## Prérequis locaux

| Outil | Docker dev | minikube |
|-------|------------|----------|
| Docker + Compose V2 | Oui | Oui |
| minikube, kubectl, helm | — | Oui |
| Make, curl | Recommandé | Recommandé |

```bash
make prerequis       # Docker
make prerequis-k8s   # minikube (make cluster)
```

## Développement local (Docker)

```bash
make dev          # Stack Compose (app + Adminer)
make demo         # dev + tests + liens
make links        # URLs et identifiants
make destroy      # Arrêt
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:8000/docs |
| Adminer (BDD) | http://localhost:8080 |
| Postgres | localhost:5432 (stock / stock / stock_db) |

## Kubernetes local (minikube)

```bash
make cluster        # minikube + monitoring + app Helm
make demo-k8s       # cluster + smoke test
make cluster-down   # arrêt
```

Grafana, Prometheus, dashboard K8s : voir [docs/demo-soutenance.md](docs/demo-soutenance.md).

## Validation / soutenance

| Exigence | Preuve |
|----------|--------|
| Docker | `make dev` + Adminer |
| GitHub Actions | `.github/workflows/ci.yml` (6 jobs) |
| Kubernetes | `helm/pfa-stock/` + job CI `kubernetes` + `make cluster` |
| Monitoring | kube-prometheus-stack sur minikube |
| IaC | `terraform validate` en CI |

## Production optionnelle (VPS)

Déploiement manuel via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) et [docs/vps-setup.md](docs/vps-setup.md) — **non requis** pour la soutenance.

## Identifiants démo (application)

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@stock.tn | Admin123! |
| Opérateur | operateur@stock.tn | Operateur123! |

## Commandes

```bash
make help
make dev
make cluster
make test
make verify
make lint
make destroy
make cluster-down
```

## CI / CD

| Workflow | Rôle |
|----------|------|
| `.github/workflows/ci.yml` | Tests, lint, build, Terraform, Helm, **minikube** |
| `.github/workflows/deploy.yml` | Optionnel — GHCR + Helm VPS (`workflow_dispatch`) |

## Structure

```
backend/                 API FastAPI
frontend/                React + Vite
docker/compose.dev.yml   Stack locale (+ Adminer)
helm/pfa-stock/          Chart application (+ values-minikube.yaml)
infrastructure/terraform/  Plateforme K8s (validate CI ; apply prod optionnel)
monitoring/              Prometheus / Grafana
docs/demo-soutenance.md  Guide soutenance
```
