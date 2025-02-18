FROM node:18.15-slim AS deps
WORKDIR /usr/src/app

COPY --link package*.json ./
COPY --link prisma ./prisma/
RUN npm ci

FROM node:18.15-slim AS build
WORKDIR /usr/src/app

COPY --from=deps --link /usr/src/app/ .
COPY --link . .

RUN npm run build

FROM node:18.15-slim
WORKDIR /usr/src/app

COPY --from=build --link /usr/src/app/node_modules ./node_modules
COPY --from=build --link /usr/src/app/package*.json ./
COPY --from=build --link /usr/src/app/prisma ./prisma
COPY --from=build --link /usr/src/app/dist ./dist

EXPOSE 3000
CMD [ "npm", "run", "start" ]
