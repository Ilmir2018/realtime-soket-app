FROM node:14 AS development

WORKDIR /ilmir/front/src/app

COPY package*.json ./

RUN npm install
RUN npm install  -g @angular/cli@14.1.0

COPY . .

RUN npm run build

EXPOSE 4200