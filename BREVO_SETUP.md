# Brevo setup for WIN intake form

## Security

- **Rotate your API key** if it was shared in chat or email.
- Store `BREVO_API_KEY` only in **Cloudflare Pages** environment variables (encrypted). Never commit it to git.

**Important:** If Brevo → Security → **Authorised IPs** is enabled, Cloudflare Pages requests will be blocked (502 errors). Either disable IP restriction for this API key or allow Cloudflare egress (recommended: disable IP lock for the website integration key).

## 1. Create custom contact attributes

From your machine (after allowing your IP in Brevo → Security → Authorised IPs):

```bash
cd /Users/batcave/WIN_web_prod
BREVO_API_KEY=your_key node scripts/create-brevo-attributes.mjs
```

This creates text attributes defined in `lib/brevo-attributes.js`.

## 2. Contact lists (configured)

| Role | List | ID |
|------|------|-----|
| Veteran | Veteran Intake | 26 |
| Employer | Employer Intake | 27 |
| Donor | Donor Intake | 28 |

Submissions are added to the correct list **immediately** via `POST /v3/contacts` (no double opt-in).

In Brevo, ensure each list does **not** require double opt-in for API-added contacts (Contacts → Lists → list settings), or contacts may stay unconfirmed depending on your Brevo account settings.

## 3. Newsletter list (`_newsletter`)

The footer form posts to `/api/newsletter`. If `BREVO_LIST_NEWSLETTER` is empty, the API **automatically finds** a Brevo list named `_newsletter` (or containing “newsletter”) or **creates** `_newsletter` on first subscribe.

To pin a specific list ID (optional, slightly faster):

```bash
BREVO_API_KEY=your_key node scripts/ensure-brevo-newsletter-list.mjs
```

Then set `BREVO_LIST_NEWSLETTER` in `wrangler.toml` and Cloudflare Pages → Environment variables.

## 4. Cloudflare Pages environment variables

| Variable | Value |
|----------|-------|
| `BREVO_API_KEY` | Your Brevo API key (secret) |
| `BREVO_LIST_VETERAN` | `26` |
| `BREVO_LIST_EMPLOYER` | `27` |
| `BREVO_LIST_DONOR` | `28` |
| `BREVO_LIST_NEWSLETTER` | Your `_newsletter` list ID |

Non-secret defaults are in `wrangler.toml` `[vars]`. Set the API key via dashboard or:

```bash
chmod +x scripts/set-cloudflare-secrets.sh
./scripts/set-cloudflare-secrets.sh
```

Deploy from **`main`** (must include `functions/api/intake.js` and `package.json`).

## 5. Test

1. Set `BREVO_API_KEY` in Cloudflare Production.
2. Submit each intake role on the live site.
3. In Brevo, verify the contact appears in list **26**, **27**, or **28** with attributes filled.
4. Optional smoke test: `node scripts/test-intake-api.mjs`
