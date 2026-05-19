# Guide démo soutenance — validation PFA sans VPS

Ce guide couvre les **exigences prof** : Docker, GitHub Actions, Kubernetes, plus Grafana/Prometheus, visualisation BDD et cluster.

## Prérequis

| Outil | Démo Docker | Démo K8s (minikube) |
|-------|-------------|---------------------|
| Docker + Compose | Oui | Oui (driver minikube) |
| Make, curl | Recommandé | Recommandé |
| minikube, kubectl, helm | — | Oui |
| RAM | 4 Go suffisant | **8 Go recommandé** (4 Go : `MINIKUBE_MEM=2048`) |

```bash
make prerequis          # Docker
make prerequis-k8s      # minikube + kubectl + helm
```

---

## 1. Docker (développement)

```bash
make demo               # stack + tests + liens
# ou
make dev && make links
```

| Service | URL |
|---------|-----|
| Application | http://localhost:3000 |
| API / Swagger | http://localhost:8000/docs |
| Métriques Prometheus (API) | http://localhost:8000/metrics |
| **Adminer (BDD)** | http://localhost:8080 |
| PostgreSQL | `localhost:5432` — user `stock`, pass `stock`, db `stock_db` |

Dans Adminer : système **PostgreSQL**, serveur **postgres**, identifiants ci-dessus.

Comptes application : `admin@stock.tn` / `Admin123!`

---

## 2. GitHub Actions

Ouvrir le dépôt → **Actions** → workflow **CI PFA Stock**.

Jobs attendus (verts) :

| Job | Rôle |
|-----|------|
| backend | ruff + pytest |
| frontend | eslint + vitest |
| docker | build images API + Web |
| terraform | fmt + validate |
| helm | lint + template |
| **kubernetes** | minikube éphémère + `helm upgrade` + smoke `/health` |

Le workflow **Deploy PFA Stock** est **manuel** (`workflow_dispatch`) — production VPS optionnelle.

---

## 3. Kubernetes local (minikube)

**Ne pas** lancer `make dev` en parallèle (deux PostgreSQL).

```bash
make cluster            # ~10–15 min la 1ère fois
make demo-k8s           # cluster + smoke test
make cluster-down       # arrêt
```

### /etc/hosts

Le script affiche une ligne du type :

```text
192.168.49.2  pfa.test api.pfa.test grafana.test pgadmin.test
```

À ajouter sur la machine de démo (adapter l’IP : `minikube ip -p pfa`).

### Accès

| Outil | URL / commande |
|-------|----------------|
| Application | http://pfa.test |
| API | http://api.pfa.test/health |
| **Grafana** | http://grafana.test — admin / `GrafanaAdmin123!` |
| **Prometheus** | via Grafana (datasource) ou port-forward svc prometheus |
| **Dashboard K8s** | `minikube dashboard -p pfa` |
| **pgAdmin (BDD K8s)** | http://pgadmin.test — `admin@pfa.test` / `PgAdmin123!` |

Dashboard JSON « PFA Stock API » : injecté via ConfigMap (label `grafana_dashboard=1`).

---

## 4. Déroulé soutenance (~15 min)

1. **Actions** — capture pipeline CI vert (30 s).
2. **`make dev`** — app + **Adminer** sur la BDD (3 min).
3. **`make cluster`** (pré-démarré) — `kubectl get pods -A`, Grafana, pgAdmin, `minikube dashboard` (5 min).
4. **Architecture** — même chart Helm en CI et en local ; Terraform validé en CI.

---

## 5. Production optionnelle

[VPS k3s dédié](vps-setup.md) — optionnel, hors validation soutenance.

---

## Dépannage rapide

| Problème | Piste |
|----------|--------|
| minikube OOM | `MINIKUBE_MEM=2048 make cluster` ; `WITH_PGADMIN=false make cluster` si besoin |
| Ingress timeout / ImagePullBackOff | DNS Arch : le script corrige CoreDNS + `/etc/resolv.conf` du nœud ; relancer `make cluster` |
| Ingress 404 | Vérifier `/etc/hosts` (`minikube ip -p pfa`) et `kubectl get pods -n ingress-nginx` |
| ImagePullBackOff (app) | Images buildées dans le daemon Docker minikube — relancer `make cluster` |
| CI kubernetes fail | Logs job ; runner GitHub a assez de RAM pour minikube |
