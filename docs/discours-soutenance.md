# Discours — Présentation StockFlow

**Durée cible : 10 à 12 minutes** (hors questions et démo optionnelle)  
**Slides : 13** — fichier `presentation-soutenance.html`  
**Conseil :** parler lentement sur les diagrammes. La démo live n’est pas dans le fil — uniquement si le jury la demande après les questions.

---

## Slide 1 — StockFlow (≈ 45 s)

Bonjour,

Je vais vous présenter **StockFlow** : une application de gestion de stock couplée à une chaîne DevOps complète.

L’objectif n’est pas seulement d’avoir une interface pour gérer des produits, mais de montrer qu’on peut livrer, tester, déployer et superviser tout ça de façon **reproductible** — avec **Docker uniquement** sur la machine de démo, sans installer Python, Node, Terraform ou kubectl à la main.

Tout le projet tourne en local : développement avec Compose, environnement proche production avec Kubernetes, et pipeline CI sur GitHub.

---

## Slide 2 — Plan (≈ 30 s)

Voici le fil de la présentation.

D’abord l’**architecture applicative** et ce que fait le produit.

Ensuite l’**infrastructure** : Compose, cluster kind, Terraform.

Puis les **choix techniques** et surtout le **CI/CD**, avec le détail de chaque job.

On finira par l’**observabilité**, un aperçu de l’**interface**, puis la **conclusion**. Si vous voulez une démonstration en direct ensuite, je pourrai l’enchaîner sur demande.

---

## Slide 3 — Architecture applicative (≈ 1 min 15)

Sur ce schéma, le flux est classique en trois tiers.

Le navigateur charge une **SPA React** — build Vite, servie par **nginx** en production.

Elle appelle l’API REST en **`/api/v1`**, hébergée par **FastAPI** : validation Pydantic, SQLAlchemy pour PostgreSQL, authentification **JWT** avec rôles admin et opérateur.

PostgreSQL est la **source de vérité** pour les stocks et l’historique des mouvements.

Côté transversal : **Alembic** pour les migrations, endpoint **`/health`** pour les sondes Kubernetes, et **`/metrics`** pour Prometheus.

Les exports passent par un bucket **S3** — simulé en local avec LocalStack, provisionné par Terraform.

---

## Slide 4 — Docker Compose (≈ 1 min)

En développement, tout est dans **`docker/compose.dev.yml`**, sur un réseau bridge **`pfa`**.

Quatre services : **postgres** avec healthcheck, **api** qui attend que la base soit prête, **web** qui attend l’API, et **localstack** pour le S3.

Les ports exposés : **3000** pour le front, **8000** pour l’API et Swagger.

Pourquoi Compose ici ? Parce que la boucle dev est rapide — rebuild ciblé — tout en gardant les **mêmes Dockerfiles** que ceux utilisés plus tard dans le cluster.

La commande d’entrée est **`make dev`** : aucun runtime à installer sur l’hôte.

---

## Slide 5 — Kubernetes (≈ 1 min 30)

En mode « production locale », on monte un cluster **kind** : un nœud control-plane, avec ingress prêt sur le port **80**.

Le diagramme montre trois zones.

**ingress-nginx** : le contrôleur Ingress, configuré pour kind avec hostPort 80 — l’app est sur **http://localhost**.

Dans le namespace **`pfa-stock`**, le chart Helm déploie : l’**Ingress** qui route `/` vers le front et `/api` vers l’API ; les Deployments **web** et **api** ; un **StatefulSet PostgreSQL** ; **LocalStack** pour S3 ; et un **ServiceMonitor** qui pointe vers `/metrics` sur l’API.

Dans **monitoring**, **kube-prometheus-stack** fournit Prometheus et Grafana. La ligne pointillée bleue, c’est le scrape toutes les **30 secondes**.

Point important : le namespace `pfa-stock` est créé par **Terraform**, pas deux fois par Helm — ça évite les conflits au déploiement.

---

## Slide 6 — Terraform (≈ 1 min 15)

Terraform est la **source de vérité** pour l’infra déclarative.

Le provider AWS pointe vers **LocalStack** : on crée le bucket **`pfa-stock-exports`** avec versioning.

Ensuite trois **helm_release** enchaînées avec `depends_on` : **ingress-nginx**, **kube-prometheus-stack**, puis l’application **pfa-stock**.

On injecte aussi le **dashboard Grafana** via ConfigMap — le JSON est versionné dans le dépôt.

Tout s’exécute dans un conteneur outils (`compose.outils.yml`) : pas besoin de Terraform installé localement.

En production, on changerait le provider et le backend — la structure du code reste la même.

---

## Slide 7 — Stack applicative (≈ 1 min)

Quelques mots sur les choix côté application.

**FastAPI** : async, OpenAPI automatique sur `/docs`, écosystème Python mature pour une API métier qu’on fait évoluer vite.

**React + Vite + TypeScript** : UI composable, build rapide, typage ; le résultat est du statique dans nginx — image légère en cluster.

**PostgreSQL 16** : relations claires entre catégories, produits et mouvements ; même moteur en dev, en CI et en prod.

**Docker multi-stage** : ce qu’on build en CI est ce qu’on déploie — pas d’écart « ça marchait sur ma machine ».

---

## Slide 8 — Stack infrastructure (≈ 1 min 15)

Côté infra :

**kind** : Kubernetes conforme, gratuit, idéal pour démontrer Ingress, probes et CRD monitoring sans cloud.

**Helm** : le chart `pfa-stock` paramétrable via `values.yaml` ; on le lint et on le template en CI.

**Terraform + provider Helm** : un seul `apply` pour S3 et les releases — reviewable en pull request.

**LocalStack** : API S3 compatible AWS sans compte ni facturation.

**kube-prometheus-stack** : standard industrie ; découverte via **ServiceMonitor**, pas de scrape config à la main.

**Grafana** : dashboard **StockFlow API** en JSON dans Git, injecté par Terraform — même discipline que le code applicatif.

---

## Slide 9 — CI/CD vue d’ensemble (≈ 1 min)

Le pipeline est dans **`.github/workflows/ci.yml`**.

À chaque push ou PR sur **main** ou **develop**, **six jobs tournent en parallèle** — pas un seul job monolithique qui met cinq minutes à échouer à la fin.

**backend** : qualité et tests API.  
**frontend** : lint et tests React.  
**docker** : les deux images doivent builder sur un runner propre.  
**terraform** : format et validate.  
**helm** : lint et rendu des manifests.  
**kubernetes** : cluster kind éphémère pour valider le chart.

L’idée : feedback rapide, périmètres séparés, chaque couche de la stack est gardée par un job dédié.

*(Si tu as la capture GitHub Actions, montre-la ici.)*

---

## Slide 10 — CI/CD détail (≈ 1 min 30)

Je détaille le **pourquoi** de chaque job — c’est le cœur de la démarche DevOps du projet.

**Backend** : **ruff** pour le lint, **pytest** avec un vrai **PostgreSQL en service container** — ce ne sont pas des mocks ; on teste l’intégration DB comme en prod.

**Frontend** : **eslint** et **vitest** sur Node 20, aligné avec l’image de build.

**Docker** : **buildx** construit `pfa-stock-api` et `pfa-stock-web` ; si le Dockerfile casse, on le voit avant le merge.

**Terraform** : `fmt -check` et `validate` avec `init -backend=false` — pas de state distant en CI, mais la syntaxe et les providers sont vérifiés.

**Helm** : `helm lint` et `helm template` — on attrape YAML invalide ou values incorrectes sans déployer.

**Kubernetes** : **kind-action** crée un cluster **`pfa-ci`** éphémère ; le chart est testé contre une vraie API Kubernetes, pas seulement du lint statique.

En résumé : on ne merge pas du code, des manifests ou des images non vérifiés.

---

## Slide 11 — Observabilité (≈ 1 min)

Pour le monitoring : l’API expose **`/metrics`** via l’instrumentateur Prometheus.

Le **ServiceMonitor** dans le chart porte le label `release: kube-prometheus-stack` pour que l’operator Prometheus le découvre.

Prometheus scrape toutes les **30 s** ; Grafana consomme ces séries.

Le dashboard — requêtes HTTP, latence, erreurs 5xx — est dans **`monitoring/dashboards/`** et déployé par Terraform.

En conditions réelles, le trafic sur l’app se reflète dans Grafana via **`make grafana`** et le port **3001**.

---

## Slide 12 — Interface (≈ 45 s)

Côté produit, l’interface **StockFlow** est une app React moderne : tableau de bord avec KPIs, CRUD produits et catégories, timeline des mouvements, page alertes quand le stock passe sous le seuil.

Les captures sur la slide illustrent le parcours : connexion, dashboard, puis écran métier ou infrastructure.

L’environnement est accessible sur **http://localhost** en cluster, compte **admin@stock.tn** / **Admin123!** — tout est documenté dans le README du dépôt.

---

## Slide 13 — Conclusion (≈ 30 s)

Pour conclure :

**StockFlow** combine une application de gestion de stock utilisable et une chaîne DevOps bout en bout — Docker, Kubernetes, IaC, monitoring, CI.

Tout est reproductible depuis le dépôt ; la migration vers un cloud réel — EKS, S3, RDS — est surtout un changement de provider et de cluster, pas une réécriture.

Merci pour votre attention. Je réponds à vos questions — et si vous souhaitez une **démonstration live**, je peux enchaîner tout de suite.

---

## Annexe — Démo live (uniquement si demandée)

*Ne pas annoncer au début ; enchaîner seulement après « oui » du jury. Compter 8 à 12 minutes.*

1. **Application** — `http://localhost` : login admin, créer un mouvement, montrer les alertes.  
2. **Kubernetes** — `export KUBECONFIG="$(pwd)/.kube/config"` puis `kubectl get pods,ingress -n pfa-stock`.  
3. **Helm** — `helm list -A`.  
4. **Terraform** — `docker compose -f docker/compose.outils.yml run --rm terraform state list`.  
5. **Grafana** — `make grafana` → dashboard API pendant navigation dans l’app.  
6. **CI** — onglet GitHub Actions, workflow vert.

Commandes utiles : `make demo-cluster`, `make links`, `make grafana`.

---

## Phrases de secours (questions fréquentes)

**Pourquoi pas Docker Compose en prod ?**  
Compose convient au dev ; Kubernetes apporte les probes, le scaling, les ServiceMonitor et l’Ingress — ce qu’on veut montrer en environnement proche prod.

**Pourquoi kind et pas Minikube ?**  
kind est léger, CI-friendly (`kind-action`), et très utilisé pour les tests de charts.

**Secrets en clair dans values.yaml ?**  
C’est volontaire pour la démo locale ; en prod on utiliserait External Secrets ou le secret manager du cloud.

**Coût cloud ?**  
Zéro en local ; LocalStack et kind évitent un compte AWS.

**Temps de `make demo-cluster` ?**  
Comptez 15 à 25 minutes la première fois.

---

## Checklist avant de parler

- [ ] Cluster ou stack dev déjà démarré (`make demo-cluster` ou `make dev`) — obligatoire si démo possible
- [ ] `export KUBECONFIG="$(pwd)/.kube/config"` mémorisé pour la démo kubectl
- [ ] Captures insérées dans le HTML (recommandé si pas de démo)
- [ ] Onglet GitHub Actions ouvert en arrière-plan
- [ ] Grafana : `make grafana` testé une fois la veille
