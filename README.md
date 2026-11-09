# Podróże Pawła

Static one-page app presenting the journeys of the apostle Paul. It is a
Design Component page rendered in the browser by React (vendored), so there
is no build step.

## Layout

- `site/` – everything that gets published (`index.html`, `support.js`, `vendor/`)
- `.github/workflows/deploy.yml` – deploys `site/` to GitHub Pages on every push to `main`

## Local preview

```bash
python3 -m http.server --directory site 8000
```

Open <http://localhost:8000>. (Serve over HTTP; some browsers block the scripts on `file://`.)

## Deployment

1. In the repository go to **Settings → Pages** and set **Source** to **GitHub Actions** (one-time).
2. Merge to `main`; the workflow publishes the site at `https://<user>.github.io/paul-journeys/`.
   It can also be run manually from the **Actions** tab.

All asset paths are relative, so the site works under the `/paul-journeys/` sub-path.
