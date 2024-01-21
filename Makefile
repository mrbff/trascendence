COMPOSE_FILE := docker-compose.yml

build:
	@/nfs/homes/${USER}/sgoinfre/bin/docker-compose -f $(COMPOSE_FILE) build --no-cache
	@npm install --prefix ./angular_volume/
	@npm install --prefix ./nest_volume/

up:
	@echo "\e[32mStarting trascendence\e[0m"
	@/nfs/homes/${USER}/sgoinfre/bin/docker-compose -f $(COMPOSE_FILE) up -d

up-d:
	@echo "\e[32mStarting trascendence\e[0m"
	@/nfs/homes/${USER}/sgoinfre/bin/docker-compose -f $(COMPOSE_FILE) up

down:
	@echo "\e[31mShutdown\e[0m"
	@/nfs/homes/${USER}/sgoinfre/bin/docker-compose -f $(COMPOSE_FILE) down

stop:
	@echo "\e[31mShutdown\e[0m"
	@/nfs/homes/${USER}/sgoinfre/bin/docker-compose -f $(COMPOSE_FILE) stop

clean:
	@echo "\e[31mStopping containers && Removing images\e[0m"
	@/nfs/homes/${USER}/sgoinfre/bin/docker-compose -f $(COMPOSE_FILE) down --rmi all

fclean: clean
	@docker container prune -f
	@docker builder prune -af

re: fclean build

debug:
	@/nfs/homes/${USER}/sgoinfre/bin/docker-compose -f $(COMPOSE_FILE) logs

.PHONY: build up down clean fclean debug re


