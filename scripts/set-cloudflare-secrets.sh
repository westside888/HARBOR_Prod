#!/usr/bin/env bash
# Set encrypted Cloudflare Pages secrets (run from repo root after wrangler login).
# Usage:
#   ./scripts/set-cloudflare-secrets.sh
set -euo pipefail
PROJECT="${CLOUDFLARE_PAGES_PROJECT:-win-web-prod}"

echo "Project: $PROJECT"
echo "You will be prompted for BREVO_API_KEY and BREVO_DOI_TEMPLATE_ID."
echo "List IDs and redirect URL are in wrangler.toml [vars] — mirror them in Pages dashboard if needed."
echo ""

wrangler pages secret put BREVO_API_KEY --project-name "$PROJECT"
wrangler pages secret put BREVO_DOI_TEMPLATE_ID --project-name "$PROJECT"

echo "Done. Deploy from main and test intake at /#intake"
