export IP=$(shell hostname -I | tr -d '[:space:]')
COMPOSE_FILE := docker-compose.yml

build: replace_ip
	@/nfs/homes/${USER}/sgoinfre/bin/docker-compose -f $(COMPOSE_FILE) build --no-cache

up: replace_ip
	@echo "\e[32mStarting transcendence\e[0m"
	@/nfs/homes/${USER}/sgoinfre/bin/docker-compose -f $(COMPOSE_FILE) up -d

up-d: replace_ip
	@echo "\e[32mStarting transcendence\e[0m"
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

replace_ip:
	@sed -i "s/${shell cat .env | grep -oP '%2F\K.*?(?=%3A8080)' | sed 's/^%2F//'}/${IP}/g" .env

.PHONY: build up down clean fclean debug re


