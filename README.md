# PFA — Gestion de Stock (DevOps local)

Application de gestion d'inventaire : backend FastAPI, frontend React, base PostgreSQL. Déploiement entièrement local via Docker, Kubernetes (kind), Terraform (LocalStack + Helm), monitoring Prometheus/Grafana.

## Prérequis (installation locale)

| À installer | Obligatoire | Notes |
|-------------|-------------|-------|
| **Docker** ou **Podman** | Oui | Avec le plugin **Compose V2** (`docker compose`) |
| **Make** | Recommandé | Pour les commandes ci-dessous |
| **curl** | Recommandé | Utilisé par les scripts de vérification |
| **git** | Optionnel | Pour pousser sur GitHub |

**À ne pas installer** (tout passe par Docker) : Python, Node.js, npm, PostgreSQL, Terraform, kubectl, Helm, kind.

Vérifier l’environnement :

```bash
make prerequis
```

### Démarrer tout en une commande

| Commande | Durée | Usage |
|----------|-------|--------|
| `make demo` | ~2–5 min | App + tests + liens (Docker Compose, quotidien) |
| `make demo-cluster` | ~15–25 min | Stack complète soutenance (kind + Terraform + Grafana) |

Afficher uniquement les liens / mots de passe :

```bash
make links
```

8 Go RAM recommandés pour `make demo-cluster`.

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
| App       | http://localhost (port 80, pas 3000) |
| Grafana   | `./scripts/port-forward-grafana.sh` puis http://localhost:3001 |

Pour `kubectl` sur l’hôte, le cluster kind expose son config ici :

```bash
export KUBECONFIG="$(pwd)/.kube/config"
kubectl get pods -A
```

Sans cette variable, `kubectl` tente `localhost:8080` et échoue.

## Identifiants démo

| Rôle      | Email                  | Mot de passe   |
|-----------|------------------------|----------------|
| Admin     | admin@stock.tn         | Admin123!      |
| Opérateur | operateur@stock.tn     | Operateur123!  |

Grafana (cluster) : utilisateur `admin`, mot de passe `GrafanaAdmin123!`

## Commandes

```bash
make help           # Liste des commandes
make demo           # Tout (dev) + vérifications + liens / identifiants
make demo-cluster   # Tout (cluster) + Grafana + vérifications + liens
make dev            # Stack Docker Compose seulement
make cluster        # Cluster Kubernetes seulement
make test           # Tests unitaires (Docker)
make verify         # Smoke tests (stack déjà lancée)
make verify MODE=cluster
make links          # URLs + comptes
make grafana        # Port-forward Grafana (cluster)
make destroy        # Tout arrêter
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
frontend/         Interface React
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

## Dépannage cluster

Si `helm_release.pfa_stock` échoue avec `namespaces "pfa-stock" already exists` :

```bash
./scripts/reparer-cluster.sh
```

Ou manuellement : `make destroy` puis `make cluster`.

## Soutenance — scénario de démo (15–20 min)

### 1. Application (2 min)
- Ouvrir http://localhost
- Connexion `admin@stock.tn` / `Admin123!`
- Montrer tableau de bord, produits, mouvement entrée/sortie, alertes stock

### 2. Docker / Compose (2 min)
- `docker ps` : conteneurs kind + localstack
- Expliquer `make dev` (développement) vs `make cluster` (prod-like)

### 3. Kubernetes + Helm (3 min)
```bash
export KUBECONFIG="$(pwd)/.kube/config"
kubectl get pods -n pfa-stock
kubectl get ingress -n pfa-stock
helm list -A
```
- Montrer chart `helm/pfa-stock/` (api, web, postgres, ServiceMonitor)

### 4. Terraform / IaC cloud (3 min)
```bash
docker compose -f docker/compose.outils.yml run --rm terraform state list
```
- LocalStack : bucket S3 `pfa-stock-exports` (AWS simulé sans serveur réel)
- Helm releases gérés par Terraform (`infrastructure/terraform/helm.tf`)

### 5. Monitoring Prometheus / Grafana (3 min)
```bash
./scripts/port-forward-grafana.sh
```
- Grafana http://localhost:3001 — `admin` / `GrafanaAdmin123!`
- Dashboard **PFA Stock — API FastAPI** (défini en code : `monitoring/dashboards/pfa-stock-api.json` + ConfigMap Terraform)
- `kubectl get servicemonitor -n pfa-stock`

### 6. CI/CD GitHub Actions (2 min)
- Montrer `.github/workflows/ci.yml` : tests, build Docker, validate Terraform, helm lint
- Capture ou run verte sur GitHub

### 7. Architecture (2 min)
- Schéma : navigateur → Ingress → React / FastAPI → PostgreSQL
- Prometheus scrape API ; Terraform provisionne kind + LocalStack + Helm

### Phrase clé pour le professeur
« En production on remplacerait kind par EKS/GKE, LocalStack par AWS réel, et le même Terraform/Helm s’appliquerait avec peu de changements. »
