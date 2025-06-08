.PHONY: dev-clock clean-clock

dev-clock:
	docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build investorhub-clock

clean-clock:
	docker-compose -f docker-compose.yml -f docker-compose.override.yml down
	docker-compose -f docker-compose.yml -f docker-compose.override.yml build --no-cache investorhub-clock

# Clean and rebuild the clock service with cache bust
rebuild-clock: clean-clock
	docker-compose -f docker-compose.yml -f docker-compose.override.yml build --build-arg CACHE_BUST=$(shell date +%s) investorhub-clock
	docker-compose -f docker-compose.yml -f docker-compose.override.yml up investorhub-clock 