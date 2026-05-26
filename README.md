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

## Deploy

Serve the repo root as the web root so `index.html` is the default document.
