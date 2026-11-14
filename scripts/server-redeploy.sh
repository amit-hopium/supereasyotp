#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ ! -f .env.production ]]; then
  echo "Missing .env.production in $(pwd). Copy .env.production.example and configure secrets first."
  exit 1
fi
pnpm production:check
docker compose --env-file .env.production -f infra/compose.production.yaml up -d --build
curl -fsS "https://${API_HOST:-api.hopiumstudio.com}/readyz"
echo
echo "Redeploy finished. Verify OAuth redirect_uri with curl to /v1/oauth/start."
