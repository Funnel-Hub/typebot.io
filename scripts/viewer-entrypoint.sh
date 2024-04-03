#!/bin/bash
npm install -g dotenv-cli
cp .env ./apps/viewer
cd apps/viewer
dotenv -e .env node  -e "const { configureRuntimeEnv } = require('next-runtime-env/build/configure'); configureRuntimeEnv();"
dotenv -e .env node server.js