#!/bin/bash

npm install -g dotenv-cli
cp .env ./apps/builder
mkdir -r prisma
cp -r ./packages/prisma/postgresql/migrations ./prisma
cp -r ./packages/prisma/postgresql/schema.prisma ./prisma
dotenv -e .env ./node_modules/.bin/prisma migrate deploy
cd apps/builder;
dotenv -e .env node server.js