#!/usr/bin/env bash
# Set encrypted Cloudflare Pages secret (run from repo root after wrangler login).
set -euo pipefail
PROJECT="${CLOUDFLARE_PAGES_PROJECT:-win-web-prod}"

echo "Project: $PROJECT"
echo "You will be prompted for BREVO_API_KEY."
echo "List IDs are in wrangler.toml [vars] — mirror them in Pages dashboard if needed."
echo ""

wrangler pages secret put BREVO_API_KEY --project-name "$PROJECT"

echo "Done. Deploy from main and test intake at /#intake"
