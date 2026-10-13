# SWAR Templates

Netlify starter templates for [TanStack Start](https://tanstack.com/start) + React. Each project under `starters/` is a standalone, deployable app.

`manifest.json` is the catalog used to select a starter and its framework. `frameworks/tanstack-start-react/.claude/skills/` contains shared implementation guidance that the scaffolding consumer can supply alongside a starter. Each starter's `AGENTS.md` describes the code actually included in that app.

## Choosing a starter for an AI agent

Use `basic` by default. It supplies the framework, Netlify adapter, theme tokens, and UI primitives without committing the generated app to a sample product or design. Choose an example starter when its behavior closely matches the request: Markdown content, charts, Stripe checkout, streaming chat, or Netlify Forms.

For frontier models, keep the working infrastructure and load relevant skills as needed; let the model create the product structure and design. For smaller models, a closely matched example also supplies useful implementation patterns and reduces how much integration work must be generated. These are engineering recommendations, not measured quality claims for this repository. Compare `basic`, a matched example, and a blank scaffold on representative prompts for each model tier; record functional success, design fit, time, tokens, and repair attempts before changing selection defaults.

The examples demonstrate integrations. They are not complete production products: the weather tool returns mock data, the SaaS starter has marketing pages, and Stripe Checkout needs verified webhooks and fulfillment for a real store. Provider model selection is separate from npm dependency versions and should be reviewed when configuring the chat example.

## Dependency baseline

Stable releases were checked against npm on 2026-10-13. Shared packages use the same exact version in every starter. Node 24 LTS is selected in `.nvmrc`, Netlify build settings, and CI; the declared engine range also permits Node 22.12+.

| Package | Version |
| --- | --- |
| React / React DOM | 19.3.0 |
| TanStack Start | 1.169.1 |
| TanStack Router | 1.170.44 |
| Vite / React plugin | 8.3.4 / 6.1.2 |
| Tailwind CSS | 4.3.3 |
| TypeScript | 6.0.3 |
| Netlify TanStack Start adapter | 1.3.19 |
| Content Collections core / Vite plugin | 0.15.3 / 0.3.1 |
| TanStack AI | 0.68.0 |
| Stripe | 23.0.0 |

**TypeScript compatibility exception:** Directly upgrading to TypeScript 7.0.2 fails while Vite loads the Netlify plugin. Its dependency-tracing packages (`zip-it-and-ship-it` → `precinct` → `detective-typescript` → `typescript-estree` → `ts-api-utils`) still import the TypeScript 6 JavaScript compiler API; accessing `TypeFlags.Intrinsic` throws before application compilation. These templates keep 6.0.3, and Renovate enforces this bound until that integration supports a direct upgrade. Microsoft's [TypeScript 7 API compatibility guidance](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6-0) also describes a side-by-side installation, which has not been validated here.

To refresh dependencies, query `npm view <package>@latest version peerDependencies engines`, update all occurrences together, review major-version migrations, and run the full smoke suite. The repository currently omits lockfiles, so exact direct pins do not freeze transitive dependencies. For reproducible releases, introduce per-starter lockfiles and `npm ci` together with a check of the scaffolding consumer's package-manager behavior.

## Smoke tests

Every PR installs and builds each starter, runs TypeScript checks, boots its production output via `vite preview`, and verifies home-page text, social metadata, and representative secondary routes. The suite also checks that every manifest entry has coverage. Workflow: `.github/workflows/smoke-test.yml`. Tests: `scripts/smoke.test.mjs` (uses `node:test`).

These checks do not exercise browser hydration, chart drawing, paid AI requests, Stripe payments, or deployed Netlify Forms submission. Verify the relevant flows separately before shipping a generated app.

### Running locally

Requirements: Node 24 LTS recommended (`nvm use`), npm. Minimum supported runtime: Node 22.12.

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

- `SKIP_INSTALL=1` — skip `npm install --no-package-lock`; use only after installing the current package versions
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

Installation runs by default even when `node_modules` exists, so dependency edits are tested. The build step runs unless `SKIP_BUILD=1` is set. Type checking always runs after the build, because routing and content plugins generate types during the first build.

**Browse a built starter interactively:**

```bash
cd starters/basic
npm install --no-package-lock && npm run build
npm run typecheck
npm run preview -- --host 127.0.0.1
# open the URL printed by vite preview — Ctrl+C to stop
```
