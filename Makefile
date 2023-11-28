COMPOSE_FILE := docker-compose.yml

build:
	@docker-compose -f $(COMPOSE_FILE) build --no-cache
	@npm install --prefix ./angular_volume/
	@npm install --prefix ./nest_volume/
	@npm install --prefix ./angular_volume/ @babylonjs/core
	@npm install --prefix ./angular_volume/ @babylonjs/loaders
	@npm install --prefix ./nest_volume/ babylonjs

up:
	@echo "\e[32mStarting trascendence\e[0m"
	@docker-compose -f $(COMPOSE_FILE) up -d

down:
	@echo "\e[31mShutdown\e[0m"
	@docker-compose -f $(COMPOSE_FILE) down

clean:
	@echo "\e[31mStopping containers && Removing images\e[0m"
	@docker-compose -f $(COMPOSE_FILE) down --rmi all

fclean: clean
	@docker container prune -f
	@docker builder prune -af

re: fclean build

debug:
	@docker-compose -f $(COMPOSE_FILE) logs

.PHONY: build up down clean fclean debug re


