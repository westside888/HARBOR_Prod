# Google Analytics (GA4) — Warriors In Need

The new static site does **not** include Google Analytics until you add a GA4 Measurement ID at deploy time. The old WordPress site likely had GA via a plugin (Site Kit, MonsterInsights, etc.); that tag is **not** in the current HTML files.

## Step 1 — Find or create the GA4 property

1. Sign in at [analytics.google.com](https://analytics.google.com) with the Google account WIN used for the old site.
2. **Admin** (gear) → **Property settings** → copy the **Measurement ID** (format `G-XXXXXXXXXX`).
3. If there is no property for `warriorsinneed.org`, create one:
   - **Admin** → **Create property** → name e.g. `Warriors In Need`
   - **Web** data stream → URL `https://warriorsinneed.org`
   - Copy the new Measurement ID.

**WIN property (confirmed):** `G-29528SEPCL` — web stream `https://warriorsinneed.org` (stream ID `12338434398`).

## Step 2 — Enable tracking on Cloudflare Pages

1. Cloudflare dashboard → **Workers & Pages** → **WIN_web_prod** (or your Pages project).
2. **Settings** → **Environment variables** → **Production** (and Preview if you want).
3. Add:

   | Variable | Value |
   |----------|--------|
   | `GA_MEASUREMENT_ID` | `G-XXXXXXXXXX` (your real ID) |

4. **Save** and trigger a new deploy (push to `main` or **Retry deployment**).

The build script injects the standard [gtag.js](https://developers.google.com/tag-platform/gtagjs) snippet into:

- `index.html`
- `win-avtech.html`
- `win-stories/win-avtech.html`

## Step 3 — Verify

1. Open [https://warriorsinneed.org](https://warriorsinneed.org) in a private window.
2. In GA4: **Reports** → **Realtime** — you should see at least one active user.
3. View page source and search for `googletagmanager.com/gtag/js?id=G-` — your ID should appear.

Or use the [Google Tag Assistant](https://tagassistant.google.com/) Chrome extension.

## Local / preview builds

```bash
GA_MEASUREMENT_ID=G-XXXXXXXXXX npm run build
python3 -m http.server 8080 --directory dist
```

Without `GA_MEASUREMENT_ID`, the build completes with no analytics script (safe for local dev).

## Optional next steps

- **Google Search Console** — link the same property to monitor search performance.
- **Custom events** — e.g. `intake_submit`, `donate_click` (requires extra `gtag('event', ...)` in JS).
- **Cookie consent** — if required for your audience, add a banner before loading gtag.

## Who needs access

Ensure WIN staff who had WordPress analytics access can open the same Google Analytics property, or invite them under **Admin** → **Property access management**.
