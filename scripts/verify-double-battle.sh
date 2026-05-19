#!/usr/bin/env bash
set -euo pipefail
REPO="/home/w8385/.openclaw/workspace/pokemon-champions-assistant"
LOG_DIR="$REPO/logs"
LOG_FILE="$LOG_DIR/double-battle-cron.log"
mkdir -p "$LOG_DIR"
{
  echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] verify start"
  cd "$REPO"
  echo "branch=$(git branch --show-current)"
  git status --short | sed 's/^/status: /' || true
  npm run build >/tmp/pca-double-build.log 2>&1 && echo "build=ok" || { echo "build=fail"; tail -n 40 /tmp/pca-double-build.log | sed 's/^/build-log: /'; exit 1; }
  echo "verify=done"
  echo
} >> "$LOG_FILE" 2>&1
