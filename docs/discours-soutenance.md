# Discours — Présentation StockFlow

**Durée cible : 10 à 12 minutes** (hors questions et démo optionnelle)  
**Slides : 13** — fichier `presentation-soutenance.html`  
**Intervenants :** Ghorbel Elyes · Souissi Mohamed Aziz — CCV 2-2  
**Conseil :** parler lentement sur les diagrammes. La démo live n’est pas dans le fil — uniquement si le jury la demande après les questions.

**Répartition :** slides impairs → **Elyes** · slides pairs → **Aziz** · slide 1 ouverture commune · slide 13 clôture partagée.

---

## Slide 1 — StockFlow (≈ 45 s)

**[Elyes]** Bonjour,

**[Aziz]** Nous allons vous présenter **StockFlow** : une application de gestion de stock couplée à une chaîne DevOps complète.

**[Elyes]** L’objectif n’est pas seulement d’avoir une interface pour gérer des produits, mais de montrer qu’on peut **livrer, tester, déployer et superviser** tout ça de façon **reproductible** — avec **Docker uniquement** sur la machine de démo, sans installer Python, Node ou kubectl à la main sur l’hôte.

**[Aziz]** La validation repose sur **deux chemins complémentaires** : développement avec **Docker Compose** (dont **Adminer** pour visualiser PostgreSQL), et orchestration avec **minikube** en local. Le pipeline **GitHub Actions** valide le tout, y compris un déploiement Helm éphémère sur minikube. Un déploiement VPS reste documenté mais **optionnel** — il n’est pas requis pour la soutenance.

---

## Slide 2 — Plan (≈ 30 s)

**[Aziz]** Voici le fil de la présentation.

D’abord l’**architecture applicative** et ce que fait le produit.

Ensuite l’**infrastructure** : Compose dev, cluster **minikube**, Terraform en mode validation CI.

Puis les **choix techniques** et surtout le **CI/CD**, avec le détail de chaque job.

On finira par l’**observabilité**, un aperçu de l’**interface**, puis la **conclusion**. Si vous voulez une démonstration en direct ensuite, nous pourrons l’enchaîner sur demande.

---

## Slide 3 — Architecture applicative (≈ 1 min 15)

**[Elyes]** Sur ce schéma, le flux est classique en trois tiers.

Le navigateur charge une **SPA React** — build Vite, servie par **nginx** en production.

Elle appelle l’API REST en **`/api/v1`**, hébergée par **FastAPI** : validation Pydantic, SQLAlchemy pour PostgreSQL, authentification **JWT** avec rôles admin et opérateur.

PostgreSQL est la **source de vérité** pour les stocks et l’historique des mouvements.

Côté transversal : **Alembic** pour les migrations, endpoint **`/health`** pour les sondes Kubernetes, et **`/metrics`** pour Prometheus via l’instrumentateur FastAPI.

---

## Slide 4 — Docker Compose (≈ 1 min)

**[Aziz]** En développement, tout est dans **`docker/compose.dev.yml`**, sur un réseau bridge **`pfa`**.

Quatre services : **postgres** avec healthcheck, **api** qui attend que la base soit prête, **web** qui attend l’API, et **Adminer** pour visualiser PostgreSQL dans le navigateur.

Les ports exposés : **3000** pour le front, **8000** pour l’API et Swagger, **8080** pour **Adminer**.

Pourquoi Compose ici ? Parce que la boucle dev est rapide — rebuild ciblé — tout en gardant les **mêmes Dockerfiles** que ceux utilisés plus tard dans le cluster.

La commande d’entrée est **`make dev`** : aucun runtime à installer sur l’hôte. Les URLs et identifiants s’affichent via **`make links`**.

---

## Slide 5 — Kubernetes (≈ 1 min 30)

**[Elyes]** Pour la validation Kubernetes, on monte un cluster **minikube** (driver Docker) avec **`make cluster`**.

Le diagramme montre trois zones.

**ingress-nginx** (Helm) : routage HTTP vers l’application et Grafana. Les hôtes locaux sont **`pfa.test`**, **`api.pfa.test`**, **`grafana.test`**, **`pgadmin.test`** — une entrée **`/etc/hosts`** pointant vers l’IP minikube suffit.

Dans le namespace **`pfa-stock`**, le chart Helm déploie : l’**Ingress** qui route le front et l’API sur des hôtes distincts ; les Deployments **web** et **api** ; un **StatefulSet PostgreSQL** ; et un **ServiceMonitor** qui pointe vers **`/metrics`** sur l’API.

Dans **monitoring**, **kube-prometheus-stack** fournit Prometheus et Grafana. La ligne pointillée bleue, c’est le scrape toutes les **30 secondes**.

**Kubernetes Dashboard** est accessible via **`minikube dashboard`** — visualisation du cluster pour la soutenance.

Point important : le **même chart Helm** et les mêmes **`values-minikube.yaml`** servent en local et dans le job CI **`kubernetes`**.

---

## Slide 6 — Terraform (≈ 1 min 15)

**[Aziz]** Terraform décrit l’infrastructure de façon **déclarative** dans **`infrastructure/terraform/`** : ingress, monitoring, outils sur un cluster Kubernetes.

En **CI**, on exécute **`terraform fmt -check`** et **`terraform validate`** — pas d’**apply** sur les runners GitHub. Ça prouve que le code IaC est syntaxiquement correct et reviewable en pull request.

Pour la **démo soutenance**, le bootstrap local ne passe **pas** par **`terraform apply`** : le script **`demarrer-cluster-minikube.sh`** installe les mêmes composants via **Helm** (ingress, kube-prometheus-stack, dashboard, application).

Un **`terraform apply`** reste possible sur un **VPS k3s** — c’est documenté dans **`docs/vps-setup.md`** et déclenché manuellement via **`deploy.yml`**. Ce chemin production est **hors périmètre** de la validation PFA.

Le **dashboard Grafana** applicatif est versionné en JSON et injecté via **ConfigMap** — même discipline que le code applicatif.

---

## Slide 7 — Stack applicative (≈ 1 min)

**[Elyes]** Quelques mots sur les choix côté application.

**FastAPI** : async, OpenAPI automatique sur `/docs`, écosystème Python mature pour une API métier qu’on fait évoluer vite.

**React + Vite + TypeScript** : UI composable, build rapide, typage ; le résultat est du statique dans nginx — image légère en cluster.

**PostgreSQL 16** : relations claires entre catégories, produits et mouvements ; même moteur en dev Compose et en cluster minikube.

**Docker multi-stage** : ce qu’on build en CI est ce qu’on déploie — pas d’écart « ça marchait sur ma machine ».

---

## Slide 8 — Stack infrastructure (≈ 1 min 15)

**[Aziz]** Côté infra :

**minikube** : cluster Kubernetes local reproductible, addon ingress, **`minikube dashboard`**, UX familière pour la démo. Le job CI recrée un cluster éphémère sur le runner.

**Helm** : le chart **`pfa-stock`** paramétrable via **`values-minikube.yaml`** (local/CI) et **`values-prod.yaml`** (VPS optionnel) ; on le lint et on le template en CI.

**Terraform** : code IaC pour la plateforme K8s — **validate en CI** ; apply prod optionnel.

**Adminer** : visualisation PostgreSQL légère en Compose — suffisant pour montrer la BDD au jury sans pgAdmin lourd.

**kube-prometheus-stack** : standard industrie ; découverte via **ServiceMonitor**, pas de scrape config à la main.

**Grafana** : dashboard **PFA Stock API** en JSON dans Git, injecté via ConfigMap — même discipline que le code applicatif.

---

## Slide 9 — CI/CD vue d’ensemble (≈ 1 min)

**[Elyes]** Le pipeline est dans **`.github/workflows/ci.yml`**.

À chaque push ou PR sur **main** ou **develop**, **six jobs tournent en parallèle** — pas un seul job monolithique qui met cinq minutes à échouer à la fin.

**backend** : qualité et tests API.  
**frontend** : lint et tests React.  
**docker** : les deux images doivent builder sur un runner propre.  
**terraform** : format et validate.  
**helm** : lint et rendu des manifests (minikube et prod).  
**kubernetes** : cluster **minikube** éphémère + **`helm upgrade`** + smoke **`/health`** in-cluster.

Le workflow **`deploy.yml`** est **manuel uniquement** (`workflow_dispatch`) — déploiement VPS optionnel, non requis pour la validation.

L’idée : feedback rapide, périmètres séparés, chaque couche de la stack est gardée par un job dédié.

*(Montrer l’onglet GitHub Actions en direct si possible.)*

---

## Slide 10 — CI/CD détail (≈ 1 min 30)

**[Aziz]** Je détaille le **pourquoi** de chaque job — c’est le cœur de la démarche DevOps du projet.

**Backend** : **ruff** pour le lint, **pytest** avec un vrai **PostgreSQL en service container** — ce ne sont pas des mocks ; on teste l’intégration DB comme en prod.

**Frontend** : **eslint** et **vitest** sur Node 20, aligné avec l’image de build.

**Docker** : les Dockerfiles API et Web doivent builder ; si le Dockerfile casse, on le voit avant le merge.

**Terraform** : `fmt -check` et `validate` avec `init -backend=false` — pas de state distant en CI, mais la syntaxe et les providers sont vérifiés.

**Helm** : `helm lint` et `helm template` sur **`values-minikube.yaml`** et **`values-prod.yaml`** — on attrape YAML invalide ou values incorrectes sans déployer.

**Kubernetes** : **minikube** démarre sur le runner ; les images sont buildées dans le daemon Docker minikube ; **ingress-nginx** et le chart **`pfa-stock`** sont déployés ; un pod **curl** teste **`http://api:8000/health`** in-cluster. C’est la preuve que le chart fonctionne sur une vraie API Kubernetes.

En résumé : on ne merge pas du code, des manifests ou des images non vérifiés.

---

## Slide 11 — Observabilité (≈ 1 min)

**[Elyes]** Pour le monitoring : l’API expose **`/metrics`** via l’instrumentateur Prometheus.

Le **ServiceMonitor** dans le chart porte le label `release: kube-prometheus-stack` pour que l’operator Prometheus le découvre.

Prometheus scrape toutes les **30 s** ; Grafana consomme ces séries.

Le dashboard — requêtes HTTP, latence, erreurs 5xx — est dans **`monitoring/dashboards/`** et déployé via ConfigMap.

En démo **minikube**, Grafana est sur **`http://grafana.test`** (entrée `/etc/hosts`). En démo **Compose**, les métriques brutes sont sur **`http://localhost:8000/metrics`** et la BDD se visualise avec **Adminer** sur **`:8080`**.

Le monitoring complet (kube-prometheus-stack) n’est **pas** installé dans le job CI — trop lourd en RAM — la preuve Grafana reste en **démo locale**.

---

## Slide 12 — Interface (≈ 45 s)

**[Aziz]** Côté produit, l’interface **StockFlow** est une app React moderne : tableau de bord avec KPIs, CRUD produits et catégories, timeline des mouvements, page alertes quand le stock passe sous le seuil.

Les trois colonnes de la slide résument le **parcours utilisateur** et les **URLs de démo** — pas de screenshots, démo live sur demande.

**Deux URLs selon le chemin de démo** :
- Compose : **`http://localhost:3000`**
- minikube : **`http://pfa.test`** (après `/etc/hosts`)

Compte démo : **admin@stock.tn** / **Admin123!** — tout est documenté dans **`docs/demo-soutenance.md`**.

---

## Slide 13 — Conclusion (≈ 30 s)

**[Elyes]** Pour conclure :

**StockFlow** combine une application de gestion de stock utilisable et une chaîne DevOps bout en bout — Docker Compose, Kubernetes minikube, IaC, monitoring, CI — **validée sans serveur de production obligatoire**.

Tout est reproductible depuis le dépôt : **`make dev`** pour le chemin Docker, **`make cluster`** pour le chemin Kubernetes, **GitHub Actions** pour la garantie continue. Un déploiement VPS reste une **perspective** documentée, pas une condition de validation.

**[Aziz]** Merci pour votre attention. Nous répondons à vos questions — et si vous souhaitez une **démonstration live**, nous pouvons enchaîner tout de suite.

---

## Annexe — Démo live (uniquement si demandée)

*Ne pas annoncer au début ; enchaîner seulement après « oui » du jury. Compter 8 à 12 minutes.*

**Ordre recommandé** (voir **`docs/demo-soutenance.md`**) :

1. **GitHub Actions** — onglet Actions, workflow CI vert (6 jobs). *(Elyes ou Aziz)*
2. **Docker** — `make dev` : app sur **`http://localhost:3000`**, **Adminer** sur **`:8080`**, montrer une table PostgreSQL. *(Aziz)*
3. **Kubernetes** — cluster pré-démarré (`make cluster`) : `kubectl get pods -A`, **`http://pfa.test`**, **Grafana** sur **`http://grafana.test`**, **pgAdmin** sur **`http://pgadmin.test`**, **`minikube dashboard -p pfa`**. *(Elyes)*
4. **Architecture** — même chart Helm en CI minikube et en local ; Terraform validé en CI. *(Aziz)*

Commandes utiles : `make dev`, `make links`, `make cluster`, `make demo-k8s`, `make cluster-down`.

**Ne pas** lancer `make dev` et `make cluster` en parallèle (deux instances PostgreSQL).

---

## Phrases de secours (questions fréquentes)

| Sujet | Qui répond (suggestion) |
|-------|-------------------------|
| Pourquoi pas Docker Compose en prod ? | Aziz |
| Pourquoi minikube et pas kind ? | Elyes |
| Pourquoi pas de déploiement auto sur push ? | Aziz |
| Secrets en clair dans values.yaml ? | Elyes |
| Coût cloud ? | Aziz |
| Temps de `make cluster` ? | Elyes |
| Visualisation BDD ? | Aziz |

**Pourquoi pas Docker Compose en prod ?**  
Compose convient au dev ; Kubernetes apporte les probes, le scaling, les ServiceMonitor et l’Ingress — ce qu’on veut montrer en environnement orchestré.

**Pourquoi minikube et pas kind ?**  
minikube offre une UX de démo familière (`minikube dashboard`, `minikube service`), des addons intégrés, et correspond au choix retenu pour la validation locale et le job CI.

**Pourquoi pas de déploiement auto sur push ?**  
La validation PFA repose sur la CI et la démo locale. Le **`deploy.yml`** VPS est manuel — pas de serveur prod requis pour la soutenance.

**Secrets en clair dans values.yaml ?**  
C’est volontaire pour la démo locale ; en prod on utiliserait External Secrets ou le secret manager du cloud.

**Coût cloud ?**  
Zéro pour la validation : tout tourne en local. Le VPS documenté est optionnel.

**Temps de `make cluster` ?**  
Comptez 10 à 15 minutes la première fois (monitoring + app). Pré-démarrer avant la soutenance.

**Visualisation BDD ?**  
**Adminer** en Compose (`:8080`). **pgAdmin** dans le cluster (`http://pgadmin.test`, installé par défaut avec `make cluster`).

---

## Checklist avant de parler

- [ ] Stack dev **ou** cluster minikube déjà démarré (`make dev` ou `make cluster`) — obligatoire si démo possible
- [ ] `/etc/hosts` configuré pour minikube : `$(minikube ip -p pfa) pfa.test api.pfa.test grafana.test pgadmin.test`
- [ ] Onglet GitHub Actions ouvert en arrière-plan (preuve CI live)
- [ ] Grafana testé une fois : `http://grafana.test` après `make cluster`
- [ ] Adminer testé : `http://localhost:8080` après `make dev`
- [ ] Répartition relue : Elyes (1·3·5·7·9·11·13 début) · Aziz (2·4·6·8·10·12·13 fin)
