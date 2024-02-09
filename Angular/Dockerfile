FROM node:20-alpine

RUN npm install -g @angular/cli @angular/material @angular/cdk @angular/animations \
	@babylonjs/core @babylonjs/loaders @babylonjs/gui babylonjs-gltf2interface

WORKDIR /usr/src/app

#COPY package*.json ./

#RUN npm install

#COPY . .

CMD ["./start.sh"]
