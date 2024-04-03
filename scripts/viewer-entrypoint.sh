#!/bin/bash
npm install -g dotenv-cli
cp .env ./apps/viewer
cp configureRuntimeEnv.js ./apps/viewer
cd apps/viewer
dotenv -e .env node configureRuntimeEnv.js
dotenv -e .env node server.js