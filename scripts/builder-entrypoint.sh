#!/bin/bash

npm install -g dotenv-cli
cp .env ./apps/builder
cd apps/builder;
dotenv -e .env ./node_modules/.bin/prisma migrate deploy --schema=packages/prisma/postgresql/schema.prisma;
dotenv -e .env HOSTNAME=0.0.0.0 PORT=3000 node apps/builder/server.js