DOCKER_COMPOSE = docker-compose.yml

dev-services:
	docker compose up app clock --build

dev-app:
	docker compose up app --build

dev-clock:
	docker compose up clock --build

services:
	docker compose -f $(DOCKER_COMPOSE) up -d redis_investorhub mongodb_investorhub prometheus_investorhub node-exporter_investorhub grafana_investorhub

up:
	docker compose -f $(DOCKER_COMPOSE) up -d --build

down:
	docker compose -f $(DOCKER_COMPOSE) down

rebuild:
	docker compose -f $(DOCKER_COMPOSE) down --volumes --remove-orphans
	docker compose -f $(DOCKER_COMPOSE) up --build

bash-app:
	docker exec -it nestjs_app_investorhub sh

bash-clock:
	docker exec -it nestjs_app_investorhub_clock sh

logs-app:
	docker compose logs -f app

logs-clock:
	docker compose logs -f clock

logs-redis:
	docker compose logs -f redis_investorhub

logs-grafana:
	docker compose logs -f grafana_investorhub

logs-prometheus:
	docker compose logs -f prometheus_investorhub

logs-node-exporter:
	docker compose logs -f node-exporter_investorhub 