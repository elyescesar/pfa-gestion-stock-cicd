COMPOSE_DEV = docker compose -f docker/compose.dev.yml
COMPOSE_OUTILS = docker compose -f docker/compose.outils.yml

.PHONY: help prerequis dev dev-down cluster destroy test verify demo demo-cluster \
        grafana links lint

help:
	@echo "PFA Gestion de Stock — commandes Make"
	@echo ""
	@echo "  make prerequis     Vérifie Docker (seul prérequis local)"
	@echo "  make demo          Démarre tout (mode dev rapide) + tests + liens"
	@echo "  make demo-cluster  Démarre tout (kind+TF+Helm, ~15 min) + tests + liens"
	@echo "  make dev           Stack Docker Compose uniquement"
	@echo "  make cluster       Cluster Kubernetes complet"
	@echo "  make test          Tests unitaires (dans Docker, sans install locale)"
	@echo "  make verify        Tests smoke sur stack déjà démarrée (MODE=dev|cluster)"
	@echo "  make links         Affiche URLs et identifiants"
	@echo "  make grafana       Port-forward Grafana (mode cluster)"
	@echo "  make destroy       Arrête tout"
	@echo ""
	@echo "Prérequis local: Docker + Docker Compose + Make (+ curl, optionnel git)"

prerequis:
	./scripts/verifier-prerequis.sh

dev:
	./scripts/demarrer-dev.sh

dev-down:
	$(COMPOSE_DEV) down

cluster:
	./scripts/demarrer-cluster.sh

destroy:
	./scripts/arreter-tout.sh

demo:
	./scripts/demarrer-tout.sh dev

demo-cluster:
	./scripts/demarrer-tout.sh cluster

test:
	docker compose -f docker/compose.dev.yml run --rm --no-deps api pytest -q
	docker run --rm -v "$(CURDIR)/frontend:/app" -w /app node:20-alpine \
		sh -c "npm ci --silent && npm test -- --run"

verify:
	./scripts/verifier.sh $(or $(MODE),dev)

links:
	@if [ -f .kube/config ] && docker ps --format '{{.Names}}' 2>/dev/null | grep -q pfa-stock-control-plane; then \
		./scripts/afficher-acces.sh cluster; \
	else \
		./scripts/afficher-acces.sh dev; \
	fi

grafana:
	./scripts/demarrer-grafana.sh

lint:
	$(COMPOSE_DEV) run --rm --no-deps api ruff check app tests
	docker run --rm -v "$(CURDIR)/frontend:/app" -w /app node:20-alpine \
		sh -c "npm ci --silent && npm run lint"
