#!/bin/bash
# ============================================================
# GLITCHED.GG — Production Deploy Script
# Pulls from GitHub, builds, copies static assets, restarts PM2
# ============================================================
set -euo pipefail

REPO_DIR="/opt/glitched"
LOG_FILE="/var/log/glitched-deploy.log"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

cd "$REPO_DIR"

log "========== DEPLOY STARTED =========="

# 1. Pull latest from GitHub
log "Pulling from origin/main..."
git fetch origin
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
  log "Already up to date ($LOCAL). Skipping build."
  exit 0
fi

git pull origin main --ff-only 2>&1 | tee -a "$LOG_FILE"
NEW_HEAD=$(git rev-parse --short HEAD)
log "Updated to $NEW_HEAD"

# 2. Install dependencies
log "Installing dependencies..."
npm ci --prefer-offline 2>&1 | tail -5 | tee -a "$LOG_FILE"

# 3. Generate Prisma client
log "Generating Prisma client..."
npx prisma generate 2>&1 | tail -3 | tee -a "$LOG_FILE"

# 4. Build Next.js (standalone mode)
log "Building Next.js..."
npx next build 2>&1 | tail -10 | tee -a "$LOG_FILE"

# 5. Copy static assets into standalone (required for output: 'standalone')
log "Copying static assets to standalone..."
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public

# 6. Restart PM2 processes
log "Restarting PM2 processes..."
pm2 restart glitched-web --update-env 2>&1 | tee -a "$LOG_FILE"

# 7. Verify the server is responding
sleep 3
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3003/ || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
  log "Server responding OK (HTTP $HTTP_CODE)"
else
  log "WARNING: Server returned HTTP $HTTP_CODE — may need manual check"
fi

log "========== DEPLOY COMPLETE ($NEW_HEAD) =========="
