# Brevo setup for WIN intake form

## Security

- **Rotate your API key** if it was shared in chat or email.
- Store `BREVO_API_KEY` only in **Cloudflare Pages** environment variables (encrypted). Never commit it to git.

## 1. Create custom contact attributes

From your machine (after allowing your IP in Brevo → Security → Authorised IPs):

```bash
cd /Users/batcave/WIN_web_prod
BREVO_API_KEY=your_key node scripts/create-brevo-attributes.mjs
```

This creates 41 text attributes defined in `lib/brevo-attributes.js`.

## 2. Double opt-in template ID

In Brevo: **Campaigns** → **Templates** → open your DOI confirmation template → note the numeric **template ID** in the URL or template settings.

Set in Cloudflare as `BREVO_DOI_TEMPLATE_ID`.

To list templates via API (with authorised IP):

```bash
BREVO_API_KEY=your_key node scripts/list-brevo-doi-templates.mjs
```

## 3. Contact lists (configured)

| Role | List | ID |
|------|------|-----|
| Veteran | Veteran Intake | 26 |
| Employer | Employer Intake | 27 |
| Donor | Donor Intake | 28 |

## 4. Redirect URL after confirmation

**`https://warriorsinneed.org/#intake?confirmed=1`**

After the user clicks the email link, they return to the intake section with a thank-you message.

Set in Cloudflare as `BREVO_DOI_REDIRECT_URL` (optional; this is the default in code).

## 5. Cloudflare Pages environment variables

| Variable | Value |
|----------|-------|
| `BREVO_API_KEY` | Your Brevo API key (secret) |
| `BREVO_DOI_TEMPLATE_ID` | DOI template numeric ID |
| `BREVO_DOI_REDIRECT_URL` | `https://warriorsinneed.org/#intake?confirmed=1` |
| `BREVO_LIST_VETERAN` | `26` |
| `BREVO_LIST_EMPLOYER` | `27` |
| `BREVO_LIST_DONOR` | `28` |

Deploy from **`main`** (commit must include `functions/api/intake.js` and `package.json`).

Non-secret defaults are in `wrangler.toml` `[vars]`. Set secrets via dashboard or:

```bash
chmod +x scripts/set-cloudflare-secrets.sh
./scripts/set-cloudflare-secrets.sh
```

## 6. Test

1. Submit veteran intake on staging/production.
2. Check email for DOI message.
3. Click confirm → land on `?confirmed=1`.
4. In Brevo, verify contact in list **26** with custom attributes filled.
