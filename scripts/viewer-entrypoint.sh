#!/bin/bash
npm install -g dotenv-cli
cp .env ./apps/viewer
cd apps/viewer
dotenv -e .env HOSTNAME=0.0.0.0 PORT=3000 node apps/viewer/server.js