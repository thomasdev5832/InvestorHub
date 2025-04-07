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