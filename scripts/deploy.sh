#!/bin/bash
set -e
echo "Deploying Glitched.gg..."
git pull origin main
pnpm install --frozen-lockfile
npx prisma migrate deploy
docker compose build --no-cache
docker compose up -d
sudo nginx -t && sudo systemctl reload nginx
echo "Done"
