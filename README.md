# WIN Web Production

Static site for [Warriors In Need](https://warriorsinneed.org) — veteran transition into civilian aviation careers.

## Pages

| File | Description |
|------|-------------|
| `index.html` | Main landing page |
| `win-avtech.html` | WIN × AvTech FAA certification partnership page |

## Local preview

```bash
cd /Users/batcave/WIN_web_prod
python3 -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080) for the landing page, or [http://localhost:8080/win-avtech.html](http://localhost:8080/win-avtech.html) for AvTech.

## Assets

AvTech page images live in `assets/images/`:

- `the-problem.jpg`
- `complete-path.jpg`
- `complete-path-2.jpg`
- `partnership-matters.jpg`
- `for-employers.jpg`

## Deploy (Cloudflare Pages)

| Setting | Value |
|---------|-------|
| Production branch | `main` |
| Build command | `npm run build` |
| Build output directory | `dist` |

The build copies `index.html`, `win-avtech.html`, and `assets/` into `dist/` — no bundler required.

**Important:** If the build log shows `HEAD is now at ab299a1`, you are redeploying an old commit (before `package.json` existed). Do **not** use **Retry** on that deployment. Create a **new deployment from `main`** (latest commit) or promote the newest successful build.

Required commit on `main`: **`5d194f1`** or later (includes `package.json` and `scripts/build.mjs`).

For other hosts, serve the repo root (or `dist/` after running `npm run build`) so `index.html` is the default document.

## Google Analytics

GA4 is optional and enabled at build time via the `GA_MEASUREMENT_ID` environment variable. See [ANALYTICS.md](ANALYTICS.md) for finding the old property ID and Cloudflare setup.

## Brevo intake CRM

The intake form posts to `/api/intake` (Cloudflare Pages Function) and triggers Brevo double opt-in. See [BREVO_SETUP.md](BREVO_SETUP.md) for API keys, attribute creation, and env vars.
