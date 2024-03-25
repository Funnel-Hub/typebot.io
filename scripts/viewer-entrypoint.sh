#!/bin/bash
npm install -g dotenv-cli
cp .env ./apps/viewer
cd apps/viewer
dotenv -e node apps/viewer/server.js