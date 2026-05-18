# PFA — Gestion de Stock

Application de gestion d'inventaire : backend FastAPI, frontend React, PostgreSQL. Développement local via Docker Compose ; production sur **k3s** (même VPS que Coolify possible) déployée par **GitHub Actions**.

## Prérequis locaux

| Outil | Obligatoire |
|-------|-------------|
| Docker + Compose V2 | Oui |
| Make | Recommandé |
| curl | Recommandé |

```bash
make prerequis
```

## Développement local

```bash
make dev          # Stack Compose
make demo         # dev + tests + liens
make links        # URLs et identifiants
make destroy      # Arrêt
```

| Service  | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| API      | http://localhost:8000/docs |
| Postgres | localhost:5432 |

## Production (VPS k3s)

| URL | Service |
|-----|---------|
| https://pfa.elyes.dev | Application |
| https://api.pfa.elyes.dev | API |
| https://grafana.pfa.elyes.dev | Grafana |
| https://pgadmin.pfa.elyes.dev | pgAdmin |
| https://dashboard.pfa.elyes.dev | Kubernetes Dashboard |

**Déploiement** : push sur `main` → workflow `Deploy PFA Stock` (build GHCR + Helm).

**Première mise en place** : [docs/vps-setup.md](docs/vps-setup.md) (coexistence **Coolify + k3s** sur un seul VPS : Traefik Coolify garde 80/443, PFA en NodePort 30080).

## Identifiants démo (application)

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@stock.tn | Admin123! |
| Opérateur | operateur@stock.tn | Operateur123! |

## Commandes

```bash
make help
make dev
make test
make verify
make lint
make destroy
```

## CI / CD

| Workflow | Rôle |
|----------|------|
| `.github/workflows/ci.yml` | Tests, lint, build, validate Terraform/Helm |
| `.github/workflows/deploy.yml` | Production : images GHCR + `helm upgrade` |

## Structure

```
backend/                 API FastAPI
frontend/                React + Vite
docker/compose.dev.yml   Stack locale
helm/pfa-stock/          Chart application
infrastructure/terraform/  Plateforme K8s (ingress, monitoring, …)
monitoring/              Prometheus / Grafana
docs/vps-setup.md        Guide VPS pas à pas
```

## Mapping exigences PFA

| Exigence | Preuve |
|----------|--------|
| Git / GitHub | Dépôt + workflows Actions |
| Tests | `backend/tests/`, `frontend/src/tests/` |
| Docker | Dockerfiles + Compose dev |
| Kubernetes | k3s VPS + `helm/pfa-stock/` |
| IaC | `infrastructure/terraform/` |
| Monitoring | kube-prometheus-stack + Grafana |
| Pipeline CI/CD | `ci.yml` + `deploy.yml` |
