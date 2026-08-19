# Base44 Dev Environment

## Project
"Sobe Desce — Placar": a pure static PWA (card-game scoreboard) in Portuguese. No build step, no backend, no external services, no secrets. All logic lives in `app.js` (vanilla JS), styled by `styles.css`, entry `index.html`, with a service worker (`sw.js`) and `manifest.json`.

## Run
`docker compose -f docker-compose.base44.yml up -d` serves the repo root via `python -m http.server 3000 --bind 0.0.0.0` (image `python:3.12-slim`, source bind-mounted at `/app`). Preview port: 3000, health path: `/`.

## Notes
- Static files are read fresh on each request, so edits to `app.js`/`styles.css`/`index.html` appear on browser refresh — no live-reload server needed. Call `reload_preview` after changes that the iframe won't pick up automatically.
- The service worker (`sw.js`) caches assets; when testing UI changes, hard-refresh to bypass the cache.
- No package install or migrations required.
