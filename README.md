# SWAR Templates

Netlify starter templates for [TanStack Start](https://tanstack.com/start) + React. Each project under `starters/` is a standalone, deployable app.

## Smoke tests

Every PR runs a smoke test that builds each starter, boots its production output via `vite preview`, and verifies the home page renders expected text. Workflow: `.github/workflows/smoke-test.yml`. Tests: `scripts/smoke.test.mjs` (uses `node:test`).

### Running locally

Requirements: Node 22+, npm.

**Test every starter:**

```bash
npm run smoke
```

**Test one or more specific starters** (pass ids as args):

```bash
npm run smoke -- basic
npm run smoke -- basic blog
```

Available ids: `basic`, `ai-chat`, `blog`, `calculator`, `dashboard`, `ecommerce`, `marketing`, `portfolio`, `resume`, `saas`, `survey`.

**Useful env vars:**

- `SKIP_INSTALL=1` — skip `npm install --no-package-lock` in the starter even if `node_modules` is missing
- `SKIP_BUILD=1` — skip `npm run build` (use the existing `dist/`)
- `PORT=9000` — bind `vite preview` to a different port (default `8787`)

```bash
SKIP_BUILD=1 npm run smoke -- basic     # rerun the smoke check without rebuilding
PORT=9000 npm run smoke -- dashboard    # if 8787 is already taken
```

**Run from scratch** (no cached install or build — closest to what CI does):

```bash
rm -rf starters/basic/node_modules starters/basic/dist
npm run smoke -- basic
```

`SKIP_INSTALL` is checked against the presence of `node_modules`; deleting it forces a fresh `npm install --no-package-lock`. The build step always runs unless `SKIP_BUILD=1` is set, so removing `dist/` is belt-and-suspenders.

**Browse a built starter interactively:**

```bash
cd starters/basic
npm install --no-package-lock && npm run build
npx vite preview --host 127.0.0.1
# open the URL printed by vite preview — Ctrl+C to stop
```
