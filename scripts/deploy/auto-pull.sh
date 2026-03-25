#!/bin/bash
# ============================================================
# GLITCHED.GG — Auto-Pull Daemon
# Polls GitHub every 60 seconds for new commits on main.
# If new commits found, runs deploy.sh
#
# This replaces the webhook approach since the server is behind
# Cloudflare and can't receive inbound webhook POSTs directly.
#
# Managed by PM2: pm2 start scripts/deploy/auto-pull.sh --name glitched-deploy --interpreter bash
# ============================================================
set -uo pipefail

REPO_DIR="/opt/glitched"
POLL_INTERVAL=60  # seconds
LOG_FILE="/var/log/glitched-deploy.log"
DEPLOY_SCRIPT="/opt/glitched/scripts/deploy/deploy.sh"
DEPLOY_LOCK="/tmp/glitched-deploy.lock"
PUSH_LOCK="/tmp/glitched-push.lock"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

is_deploying() {
  if [ -f "$DEPLOY_LOCK" ]; then
    local age=$(( $(date +%s) - $(stat -c %Y "$DEPLOY_LOCK" 2>/dev/null || echo 0) ))
    if [ "$age" -gt 600 ]; then
      rm -f "$DEPLOY_LOCK"
      return 1
    fi
    return 0
  fi
  return 1
}

log "========== AUTO-PULL DAEMON STARTED =========="
log "Polling every ${POLL_INTERVAL}s for changes on origin/main"

while true; do
  cd "$REPO_DIR"

  # Skip if a deploy is already running
  if is_deploying; then
    sleep "$POLL_INTERVAL"
    continue
  fi

  # Skip if we just pushed (avoid pulling our own push)
  if [ -f "$PUSH_LOCK" ]; then
    push_age=$(( $(date +%s) - $(stat -c %Y "$PUSH_LOCK" 2>/dev/null || echo 0) ))
    if [ "$push_age" -lt 30 ]; then
      sleep "$POLL_INTERVAL"
      continue
    fi
    rm -f "$PUSH_LOCK"
  fi

  # Fetch latest from origin (quiet)
  git fetch origin main --quiet 2>/dev/null

  LOCAL=$(git rev-parse HEAD 2>/dev/null)
  REMOTE=$(git rev-parse origin/main 2>/dev/null)

  if [ -z "$LOCAL" ] || [ -z "$REMOTE" ]; then
    sleep "$POLL_INTERVAL"
    continue
  fi

  if [ "$LOCAL" != "$REMOTE" ]; then
    # Check if remote is ahead of local (not behind)
    if git merge-base --is-ancestor "$LOCAL" "$REMOTE" 2>/dev/null; then
      BEHIND=$(git rev-list --count HEAD..origin/main)
      LATEST_MSG=$(git log origin/main -1 --pretty="%h by %an: %s")
      log "New commits detected ($BEHIND behind): $LATEST_MSG"
      log "Running deploy..."

      bash "$DEPLOY_SCRIPT" 2>&1 | tee -a "$LOG_FILE"

      if [ ${PIPESTATUS[0]} -eq 0 ]; then
        log "Deploy successful"
      else
        log "Deploy FAILED — check logs"
      fi
    else
      log "Local has commits not on remote — skipping pull (push first)"
    fi
  fi

  sleep "$POLL_INTERVAL"
done
