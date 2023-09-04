FROM node:20-alpine

RUN npm install -g @angular/cli && npm install -g bootstrap@3

WORKDIR /usr/src/app

#COPY package*.json ./

#RUN npm install

#COPY . .

CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4200"]