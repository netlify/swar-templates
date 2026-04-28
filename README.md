# SWAR Templates

Netlify starter templates for [TanStack Start](https://tanstack.com/start) + React. Each project under `starters/` is a standalone, deployable app.

## Smoke tests

Every PR runs a smoke test that builds each starter, boots its production SSR output, and verifies the home page renders expected text. Workflow: `.github/workflows/smoke-test.yml`. Shared serve wrapper: `scripts/smoke-serve.mjs`.

### Running locally

Requirements: Node 22, npm, bash.

**Test one starter:**

```bash
npm run smoke:one -- basic
```

Replace `basic` with any id under `starters/` (`basic`, `ai-chat`, `blog`, `calculator`, `dashboard`, `ecommerce`, `marketing`, `portfolio`, `resume`, `saas`, `survey`).

**Test every starter** (sequentially; mirrors what CI does):

```bash
npm run smoke
```

`npm run smoke` is an alias for `npm run smoke:all`. Both keep going on failure and print a pass/fail summary at the end.

**Useful env vars** for `smoke:one`:

- `SKIP_INSTALL=1` — skip `npm ci` even if `node_modules` is missing
- `SKIP_BUILD=1` — skip `npm run build` (use the existing `dist/` + `.netlify/v1/functions/server.mjs`)
- `PORT=9000` — bind the local server to a different port (default `8787`)

```bash
SKIP_BUILD=1 npm run smoke:one -- basic     # rerun the smoke check without rebuilding
PORT=9000 npm run smoke:one -- dashboard    # if 8787 is already taken
```

**Browse the built app interactively** (no smoke check, just serve and open in a browser):

```bash
cd starters/basic
npm ci && npm run build
node ../../scripts/smoke-serve.mjs . 8787
# open http://127.0.0.1:8787 — Ctrl+C to stop
```

This serves the same artifacts Netlify deploys: `dist/client/*` for static assets, with the SSR fetch handler from `.netlify/v1/functions/server.mjs` handling everything else. No Netlify CLI or login required.
