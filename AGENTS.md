# Base44 Dev Environment

## What this app is
A Vite + React frontend that connects to a Base44 cloud backend via `@base44/sdk` and `@base44/vite-plugin`. The backend URL and app ID are set through `VITE_BASE44_APP_BASE_URL` and `VITE_BASE44_APP_ID` env vars.

## Repo quirks
- The package manifest is named `Packard.json` (not `package.json`). A `package.json` copy is created at setup time so npm/vite can install and run. If dependencies change, update `Packard.json` and re-copy.
- The original repo only contained config files (vite.config.js, postcss.config.js, Packard.json) — no `index.html`, `src/`, `tailwind.config.js`, or `jsconfig.json`. These boilerplate files were created to make the app bootable. The actual app pages/components live on the Base44 cloud and are fetched at runtime via the SDK.
- `.env.local` lives under `gitignore/` (not the repo root). Env vars are passed directly via compose `environment:` instead.

## How to run
```
docker compose -f docker-compose.base44.yml up -d
```
The app is served on port 3000 (mapped to Vite's 5173 inside the container). Dependencies install automatically on container startup via `npm install`.

## How to verify
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` should return 200
- The page should render "Base44 App" with the app ID
- No console errors in the preview

## No external secrets required
The app connects to the Base44 backend using the app ID and base URL, which are public configuration values (not credentials). No external service credentials are needed to boot.
