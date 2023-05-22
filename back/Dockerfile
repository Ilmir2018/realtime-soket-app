#Specify node version
FROM node:14 AS development
#Ima
WORKDIR /ilmir/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000


# PRODUCTION ######

FROM node:14 AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /ilmir/src/app

COPY --from=development /ilmir/src/app .

EXPOSE 8080

CMD ["node", "dist/main"]
