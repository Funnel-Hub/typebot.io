#!/bin/bash

npm install -g dotenv-cli
cp .env ./apps/builder
cd apps/builder;
dotenv -e .env ./node_modules/.bin/prisma migrate deploy --schema=packages/prisma/postgresql/schema.prisma;
dotenv -e .env node apps/builder/server.js