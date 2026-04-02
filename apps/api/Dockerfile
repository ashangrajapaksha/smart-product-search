# Build from repo root: docker build -f apps/api/Dockerfile .
FROM node:22 AS base

WORKDIR /app

RUN npm i -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

RUN pnpm nx build api

EXPOSE 8000

CMD ["node", "dist/apps/api/main.js"]
