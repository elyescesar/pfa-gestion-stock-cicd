# PFA — Gestion de Stock (DevOps local)

Application de gestion d'inventaire : backend FastAPI, frontend React, base PostgreSQL. Déploiement entièrement local via Docker, Kubernetes (kind), Terraform (LocalStack + Helm), monitoring Prometheus/Grafana.

## Prérequis

- Docker ou Podman avec `docker compose`
- 8 Go RAM recommandés pour le mode cluster
- Aucune installation locale de Python, Node, Terraform ou kubectl

## Démarrage rapide (développement)

```bash
make dev
```

| Service   | URL                          |
|-----------|------------------------------|
| Frontend  | http://localhost:3000        |
| API docs  | http://localhost:8000/docs   |
| Postgres  | localhost:5432               |

## Démarrage cluster (démo professeur)

```bash
make cluster
```

Crée un cluster kind, applique Terraform (S3 LocalStack, Helm ingress-nginx, kube-prometheus-stack, application).

| Service   | Accès |
|-----------|-------|
| App       | http://localhost |
| Grafana   | `kubectl port-forward -n monitoring svc/kube-prometheus-stack-grafana 3001:80` puis http://localhost:3001 |

## Identifiants démo

| Rôle      | Email                  | Mot de passe   |
|-----------|------------------------|----------------|
| Admin     | admin@stock.tn         | Admin123!      |
| Opérateur | operateur@stock.tn     | Operateur123!  |

Grafana (cluster) : utilisateur `admin`, mot de passe `GrafanaAdmin123!`

## Commandes

```bash
make dev          # Stack Docker Compose
make dev-down     # Arrêt compose dev
make cluster      # kind + Terraform + Helm
make destroy      # Tout arrêter
make test         # Tests backend + frontend
```

## Mapping exigences PFA

| Exigence | Preuve dans le projet |
|----------|------------------------|
| Git / GitHub | Dépôt + `.github/workflows/ci.yml` |
| Tests | `backend/tests/`, `frontend/src/tests/` |
| Docker | `backend/Dockerfile`, `frontend/Dockerfile`, `docker/compose.dev.yml` |
| Kubernetes | `infrastructure/kubernetes/kind/`, `helm/pfa-stock/` |
| IaC Cloud | `infrastructure/terraform/localstack.tf` (S3 AWS via LocalStack) |
| Orchestration | `infrastructure/terraform/helm.tf` |
| Monitoring | `monitoring/kube-prometheus-values.yaml`, ServiceMonitor API |
| Backend Python | `backend/app/` |
| Frontend React | `frontend/src/` |
| BD SQL | PostgreSQL |
| Pipeline CI | `.github/workflows/ci.yml` |

## Structure

```
backend/          API FastAPI
frontend/         Interface React (français)
docker/           Compose dev + outils
helm/pfa-stock/   Chart Kubernetes
infrastructure/   Terraform + kind
monitoring/       Valeurs Prometheus/Grafana
scripts/          Scripts de démarrage
```

## Podman

```bash
export KIND_EXPERIMENTAL_PROVIDER=podman
make cluster
```
