COMPOSE_FILE := docker-compose.yml

build:
<<<<<<< HEAD
	@/nfs/homes/${USER}/sgoinfre/bin/docker-compose -f $(COMPOSE_FILE) build --no-cache
	#@npm install --prefix ./angular_volume/
	#@npm install --prefix ./nest_volume/

up:
	@echo "\e[32mStarting transcendence\e[0m"
	@/nfs/homes/${USER}/sgoinfre/bin/docker-compose -f $(COMPOSE_FILE) up -d

up-d:
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
=======
	@/nfs/homes/gfantech/sgoinfre/bin/docker-compose -f $(COMPOSE_FILE) build --no-cache
	@npm install --prefix ./angular_volume/
	@npm install --prefix ./nest_volume/
	@npm install --prefix ./angular_volume/ @babylonjs/core
	@npm install --prefix ./angular_volume/ @babylonjs/loaders
	@npm install --prefix ./angular_volume/ @babylonjs/gui
	@npm install --prefix ./angular_volume/ babylonjs-gltf2interface
	@npm install --prefix ./nest_volume/ babylonjs
	@npm install --prefix ./nest_volume/ babylonjs-loaders

up:
	@echo "\e[32mStarting trascendence\e[0m"
	@/nfs/homes/gfantech/sgoinfre/bin/docker-compose -f $(COMPOSE_FILE) up

down:
	@echo "\e[31mShutdown\e[0m"
	@/nfs/homes/gfantech/sgoinfre/bin/docker-compose -f $(COMPOSE_FILE) down

clean:
	@echo "\e[31mStopping containers && Removing images\e[0m"
	@/nfs/homes/gfantech/sgoinfre/bin/docker-compose -f $(COMPOSE_FILE) down --rmi all
>>>>>>> game

fclean: clean
	@docker container prune -f
	@docker builder prune -af

re: fclean build

debug:
<<<<<<< HEAD
	@/nfs/homes/${USER}/sgoinfre/bin/docker-compose -f $(COMPOSE_FILE) logs
=======
	@/nfs/homes/gfantech/sgoinfre/bin/docker-compose -f $(COMPOSE_FILE) logs
>>>>>>> game

.PHONY: build up down clean fclean debug re


