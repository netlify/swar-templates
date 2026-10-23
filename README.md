# SWAR Templates

Netlify starter templates for [TanStack Start](https://tanstack.com/start) + React. Each project under `starters/` is a standalone, deployable app.

## Dependency baseline

All starters use React 19.3.1, TanStack Start 1.169.4, Router 1.170.46, Vite 8.3.5, and TypeScript 6.0.3. Node 24 is selected for local development, Netlify builds, and CI. TypeScript stays below 7 because the Netlify adapter’s tracing dependencies require the JavaScript compiler API. Review and test major upgrades separately.

The standalone starters omit tracked lockfiles, so exact direct pins do not freeze transitive dependencies.

## Smoke tests

Every PR runs a smoke test that builds each starter, type-checks it, boots its production output via `vite preview`, and verifies the home page renders expected text. Workflow: `.github/workflows/smoke-test.yml`. Tests: `scripts/smoke.test.mjs` (uses `node:test`).

### Running locally

Requirements: npm and Node 22.13+ on the Node 22 line, Node 24, or Node 26+. Node 24 is recommended (`nvm use`). The newer lint/test tooling sets the Node 22 minimum alongside TanStack Start.

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

Installation runs by default even when `node_modules` exists, so dependency edits are tested. Type checking runs after the build generates route/content types. `SKIP_INSTALL=1` uses the existing installation.

**Browse a built starter interactively:**

```bash
cd starters/basic
npm install --no-package-lock && npm run build
npx vite preview --host 127.0.0.1
# open the URL printed by vite preview — Ctrl+C to stop
```

## Shared instructions and framework skills

Each starter's `AGENTS.md` describes its actual source, commands, configuration, and demo limits. Framework skills are supplied separately from `frameworks/tanstack-start-react/.claude/skills`; a standalone starter does not contain that directory. Keep starter-specific instructions when applying shared guidance.

When implementing a starter change, refresh compatible dependencies, remove unused/duplicate entries, check installed APIs and peer requirements, and validate changed behavior locally. A Vite build does not run TypeScript checks. Only run named package scripts that exist in that starter's package.json.

Check the documented starter paths/scripts and all nine skill entrypoints:

```bash
npm run check:guidance
```

The skills mark complete example modules with `file=...` code fences and configuration additions with `merge=...`. To build and type-check those examples against both the newer Basic packages and the older Ecommerce packages, install those starters plus Blog, then install optional documentation-only integrations in a temporary directory:

```bash
npm run smoke -- basic ecommerce blog
npm install --prefix /tmp/swar-guidance-deps --no-save --package-lock=false @netlify/identity@2.0.0 @netlify/functions @content-collections/core@0.13.1 @content-collections/vite@0.2.9
GUIDANCE_NODE_MODULES=/tmp/swar-guidance-deps/node_modules npm run check:guidance
```

The complete check writes isolated apps into an OS temporary directory and prints their paths. It does not edit starter source, deploy a site, configure live services, or send real form/auth requests. Optional integrations are kept out of every starter's dependencies. Compilation checks imports and types; HTTP and browser checks are still needed for changed user flows.
