COMPOSE_DEV = docker compose -f docker/compose.dev.yml
COMPOSE_OUTILS = docker compose -f docker/compose.outils.yml

.PHONY: dev dev-down cluster destroy test lint

dev:
	./scripts/demarrer-dev.sh

dev-down:
	$(COMPOSE_DEV) down

cluster:
	./scripts/demarrer-cluster.sh

destroy:
	./scripts/arreter-tout.sh

test:
	$(COMPOSE_DEV) run --rm api pytest -q
	cd frontend && npm test -- --run

lint:
	$(COMPOSE_DEV) run --rm api ruff check app tests
	cd frontend && npm run lint
