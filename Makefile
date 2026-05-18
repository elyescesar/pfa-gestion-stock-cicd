COMPOSE_DEV = docker compose -f docker/compose.dev.yml

.PHONY: help prerequis dev dev-down destroy test verify demo links lint

help:
	@echo "PFA Gestion de Stock — commandes Make"
	@echo ""
	@echo "  make prerequis     Vérifie Docker (seul prérequis local)"
	@echo "  make demo          Démarre tout (mode dev) + tests + liens"
	@echo "  make dev           Stack Docker Compose uniquement"
	@echo "  make test          Tests unitaires (dans Docker, sans install locale)"
	@echo "  make verify        Tests smoke sur stack déjà démarrée"
	@echo "  make links         Affiche URLs et identifiants"
	@echo "  make destroy       Arrête la stack dev"
	@echo ""
	@echo "Production: push sur main → GitHub Actions → VPS k3s (voir docs/vps-setup.md)"

prerequis:
	./scripts/verifier-prerequis.sh

dev:
	./scripts/demarrer-dev.sh

dev-down:
	$(COMPOSE_DEV) down

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
