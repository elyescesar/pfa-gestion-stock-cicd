COMPOSE_DEV = docker compose -f docker/compose.dev.yml

.PHONY: help prerequis dev dev-down destroy test verify demo links lint cluster cluster-down demo-k8s

help:
	@echo "PFA Gestion de Stock — commandes Make"
	@echo ""
	@echo "  make prerequis     Vérifie Docker (Compose dev)"
	@echo "  make prerequis-k8s Vérifie minikube, kubectl, helm (cluster local)"
	@echo "  make demo          Démarre tout (mode dev) + tests + liens"
	@echo "  make dev           Stack Docker Compose (app + Adminer)"
	@echo "  make cluster       Cluster minikube + monitoring + app Helm"
	@echo "  make cluster-down  Arrête / supprime minikube"
	@echo "  make demo-k8s      Cluster + smoke test in-cluster"
	@echo "  make test          Tests unitaires (dans Docker, sans install locale)"
	@echo "  make verify        Tests smoke sur stack déjà démarrée"
	@echo "  make links         Affiche URLs et identifiants"
	@echo "  make destroy       Arrête la stack dev"
	@echo ""
	@echo "Soutenance: docs/demo-soutenance.md · CI: GitHub Actions"

prerequis:
	./scripts/verifier-prerequis.sh

prerequis-k8s:
	./scripts/verifier-prerequis-k8s.sh

cluster:
	./scripts/demarrer-cluster-minikube.sh

cluster-down:
	./scripts/arreter-cluster-minikube.sh

demo-k8s:
	./scripts/demarrer-cluster-minikube.sh
	./scripts/verifier-cluster-minikube.sh

dev:
	./scripts/demarrer-dev.sh

dev-down:
	$(COMPOSE_DEV) down --remove-orphans

destroy:
	./scripts/arreter-tout.sh

demo:
	./scripts/demarrer-tout.sh

test:
	docker compose -f docker/compose.dev.yml run --rm --no-deps api pytest -q
	docker run --rm -v "$(CURDIR)/frontend:/app" -w /app node:20-alpine \
		sh -c "npm ci --silent && npm test -- --run"

verify:
	./scripts/verifier.sh

links:
	./scripts/afficher-acces.sh

lint:
	$(COMPOSE_DEV) run --rm --no-deps api ruff check app tests
	docker run --rm -v "$(CURDIR)/frontend:/app" -w /app node:20-alpine \
		sh -c "npm ci --silent && npm run lint"
