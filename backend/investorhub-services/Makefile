DOCKER_COMPOSE = docker-compose.yml
SERVICE_NAME = app

dev:
	docker compose up app --build

services:
	docker compose -f $(DOCKER_COMPOSE) up -d redis_investorhub mongodb_investorhub prometheus_investorhub node-exporter_investorhub grafana_investorhub

up:
	docker compose -f $(DOCKER_COMPOSE) up -d --build

down:
	docker compose -f $(DOCKER_COMPOSE) down

rebuild:
	docker compose -f $(DOCKER_COMPOSE) down --volumes --remove-orphans
	docker compose -f $(DOCKER_COMPOSE) up --build

bash:
	docker exec -it $(SERVICE_NAME) sh

logs-app:
	docker compose logs -f app

logs-redis:
	docker compose logs -f redis

logs-grafana:
	docker compose logs -f grafana

logs-prometheus:
	docker compose logs -f prometheus

logs-node-exporter:
	docker compose logs -f node-exporter