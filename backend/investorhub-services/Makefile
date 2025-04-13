DOCKER_COMPOSE = docker-compose.yml
SERVICE_NAME = nestjs_app

dev:
	docker compose up --build

up:
	docker compose -f $(DOCKER_COMPOSE) up -d --build

down:
	docker compose -f $(DOCKER_COMPOSE) down

rebuild:
	docker compose -f $(DOCKER_COMPOSE) down --volumes --remove-orphans
	docker compose -f $(DOCKER_COMPOSE) up --build

logs:
	docker compose logs -f $(SERVICE_NAME)

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