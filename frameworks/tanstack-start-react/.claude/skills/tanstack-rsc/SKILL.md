---
name: tanstack-rsc
description: Enable React Server Components support in a TanStack Start + Vite project. Use when adding RSC to a TanStack Start app, configuring @vitejs/plugin-rsc, or debugging "pnpapi" / "pg-native" errors in Vite's RSC/SSR module runner.
---

# TanStack Start RSC Setup

Turning on React Server Components in a TanStack Start project is a three-line change: install one plugin, add it to `vite.config.ts`, and flip a flag on `tanstackStart()`. The one gotcha is that a few Node-only dependencies must be externalized for Vite's `ssr` and `rsc` environments.

## Prerequisites

- **Node.js 24** — the RSC toolchain requires it. Update `netlify.toml` (or your deploy platform's config) and use `nvm use 24` locally.
- Existing TanStack Start project using `@tanstack/react-start` and Vite.

## Step 1: Install the Vite Plugin

```bash
pnpm add -D @vitejs/plugin-rsc
```

No other packages are needed. RSC helpers (`renderServerComponent`, `createCompositeComponent`) are already exported from `@tanstack/react-start/rsc` once the flag is on.

## Step 2: Update `vite.config.ts`

Two edits:

1. Import and add `rsc()` to the plugin list.
2. Pass `{ rsc: { enabled: true } }` to `tanstackStart()`.

```typescript
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import rsc from '@vitejs/plugin-rsc'
// ...other plugins

export default defineConfig({
  plugins: [
    tailwindcss(),
    tanstackStart({ rsc: { enabled: true } }),
    rsc(),
    netlifyPlugin(),
    viteReact(),
  ],
})
```

**Plugin order matters**: `tanstackStart()` comes before `rsc()`, and `viteReact()` stays last.

## Step 3: Set the Node Version

In `netlify.toml`:

```toml
[build.environment]
  NODE_VERSION = "24"
```

For other platforms, set whatever env/config they use. Locally, use `nvm use 24`.

## Step 4: Externalize Node-only Packages

Some packages must never go through Vite's bundling — either because their dev-mode module runner can't resolve them, or because they depend on their on-disk layout at runtime. Externalize them in the `ssr` and `rsc` environments **and** declare them as top-level `dependencies` in `package.json` so Netlify's function packager (nft) can trace and include them.

The exact set of packages to externalize depends on what your project uses — the list below is just an example for a project using `@tanstack/ai-code-mode` + `@netlify/database`. Add/remove entries based on the Node-only packages your own dependencies pull in (see the Generalized Pattern in Troubleshooting).

The baseline set for that example:

```typescript
const serverExternal = [
  'esbuild',
  'pg',
  'isolated-vm',
  'quickjs-emscripten',
  'quickjs-emscripten-core',
  '@jitl/quickjs-wasmfile-release-asyncify',
  '@jitl/quickjs-wasmfile-release-sync',
  '@jitl/quickjs-wasmfile-debug-asyncify',
  '@jitl/quickjs-wasmfile-debug-sync',
]

export default defineConfig({
  environments: {
    ssr: { resolve: { external: serverExternal } },
    rsc: { resolve: { external: serverExternal } },
  },
  plugins: [/* ... */],
})
```

Note: Vite's `resolve.external` accepts `string[]` only — no regex.

```jsonc
// package.json — add the top-level packages as direct deps so pnpm
// hoists them to where nft can trace them. Transitive @jitl/* variants
// and their .wasm files come along for free.
{
  "dependencies": {
    "esbuild": "^0.25.12",          // used by @tanstack/ai-code-mode
    "pg": "^8.20.0",                // used by @netlify/database
    "isolated-vm": "^6.0.2",        // used by @tanstack/ai-isolate-node
    "quickjs-emscripten": "^0.31.0" // used by @tanstack/ai-isolate-quickjs
  }
}
```

**Why each is required**:

- `esbuild` — its `lib/main.js` locates the native binary via a disk-relative path. Bundling → `The esbuild JavaScript API cannot be bundled`.
- `pg` — optional peer `pg-native` and runtime-resolved modules break Vite's dev module runner and produce subtly broken prod bundles.
- `isolated-vm` — native C++ addon (`.node` file). Can't be bundled at all.
- `quickjs-emscripten` family — the emscripten JS does `new URL("emscripten-module.wasm", import.meta.url)` to find its sibling `.wasm`. Bundling detaches them → `ENOENT: emscripten-module.wasm` at runtime.
- **Direct dependency declaration** — pnpm's symlinked `node_modules` can confuse nft when it tries to trace transitive deps. Hoisting via direct deps is reliable. Without this you get `Cannot find package 'X' imported from /var/task/v1/functions/server.mjs` at function boot.

### How to spot an "externalize this" error

Not every build error needs externalization — most are plain bugs. Externalization is the fix when a **Node-only package** is being forced through Vite's bundler or dev module runner. The signals:

- **Where the error happens**: dev server request (Vite's `ssr`/`rsc` module runner) or at Netlify function cold-start (`/var/task/v1/functions/server.mjs`) — not in the browser. Browser-only errors are never fixed by `serverExternal`.
- **What the message looks like** (any of these patterns):
  - `Cannot find module 'X'` or `Cannot find package 'X'` where `X` is a Node built-in shim (`pnpapi`), an optional peer (`pg-native`), or a platform-specific addon.
  - `Could not resolve "X" imported by "Y"` where `X` is declared as optional or loaded via `try { require('X') } catch {}`.
  - `The X JavaScript API cannot be bundled` — the package detects it was bundled and refuses to run.
  - `ENOENT: no such file or directory` for a `.wasm`, `.node`, or other sibling asset that should live next to its JS.
  - `Module did not self-register` or `NODE_MODULE_VERSION … requires NODE_MODULE_VERSION …` — native addon ABI mismatch (also needs `pnpm rebuild`, but must stay externalized).
- **What the offending package looks like**: native `.node` addon, ships a `.wasm` sibling, uses `import.meta.url` / `__dirname` to locate on-disk assets, has optional peer deps, or is pure-Node infrastructure (database drivers, bundlers, sandboxes) with no reason to go through Vite.

If the error fits the shape above, add the top-level package to both `serverExternal` **and** `dependencies` in `package.json`. See the Troubleshooting section for the specific errors encountered in this template and their fixes.

## Verification

After the changes, start the dev server and load a page:

```bash
netlify dev              # or: pnpm dev
curl -I http://localhost:8888/
```

You want a `200`. The first request is slow because Vite re-optimizes deps for the new `ssr` and `rsc` environments.

## Troubleshooting

### `Cannot find module 'pnpapi' imported from '…/esbuild/lib/main.js'`

`esbuild`'s `lib/main.js` has an unconditional `import 'pnpapi'` for Yarn PnP support. Node's native loader swallows the failure; Vite's module runner surfaces it as a 500 on every route. It shows up whenever something (e.g. `@tanstack/ai-code-mode`) pulls `esbuild` into a server environment.

**Fix**: add `'esbuild'` to `environments.ssr.resolve.external` and `environments.rsc.resolve.external`.

### `Could not resolve "pg-native" imported by "pg"`

`pg` (node-postgres) declares `pg-native` as an optional peer. Vite's runner can't resolve it, even though `pg` handles its absence gracefully at runtime.

**Fix**: add `'pg'` to the same `external` arrays. (Externalizing `pg` is correct regardless — it's a pure-Node package with no reason to go through Vite.)

### `Cannot find package 'X' imported from /var/task/v1/functions/server.mjs`

The package is externalized, but nft couldn't find it when packaging the Netlify function. This usually happens with pnpm projects where the package is only a transitive dep.

**Fix**: add the package to `dependencies` in `package.json` (use the version already resolved in `pnpm-lock.yaml`).

### `The esbuild JavaScript API cannot be bundled`

Runtime error from esbuild when it was inlined into `server.mjs`. esbuild's JS API computes a disk-relative path to its native binary, which breaks if the JS is bundled elsewhere.

**Fix**: ensure `esbuild` is in `serverExternal` and in `dependencies` — both are required.

### `Error: ENOENT: no such file or directory, open '…/emscripten-module.wasm'`

`@tanstack/ai-isolate-quickjs` → `quickjs-emscripten` → `@jitl/quickjs-wasmfile-*` ships an emscripten JS module that finds its sibling `.wasm` file via `new URL("emscripten-module.wasm", import.meta.url)`. If Vite bundles the JS into `dist/server/assets/emscripten-module-*.js`, the WASM lookup fails at runtime because the `.wasm` isn't copied along.

**Fix**: externalize the full quickjs-emscripten chain and add `quickjs-emscripten` to `dependencies`. The 4 `@jitl/quickjs-wasmfile-*` variants must be listed individually because `resolve.external` takes strings only — no regex.

### `Module did not self-register` or `NODE_MODULE_VERSION … requires NODE_MODULE_VERSION …` for `isolated-vm`

`isolated-vm` is a native C++ addon built against a specific Node ABI. If you switch Node versions (or install it on a different major than you're running), you have to rebuild.

**Fix**:

```bash
nvm use 24
pnpm rebuild isolated-vm
```

Always externalize `isolated-vm` (native `.node` files cannot be bundled regardless). If isolated-vm fails at runtime in production, the code-mode runtime falls back to QuickJS — so make sure the QuickJS chain is externalized too (see above).

### Generalized Pattern

Any Node-only dependency that either (a) imports optional native addons, (b) uses `try/catch` around dynamic imports, or (c) depends on its on-disk layout at runtime is a candidate for externalization + direct-dep declaration. Symptoms look like:

- `Cannot find module 'X'` where `X` is a platform-specific addon.
- `Could not resolve "X" imported by "Y"` for an optional peer dep.
- `The X JavaScript API cannot be bundled` or similar "bundled in wrong place" errors.

The fix is always the same shape — add the top-level package to `serverExternal` AND to `dependencies` in `package.json`.

## What You Get

With RSC enabled, routes and components can use the server component model:

- `import { renderServerComponent, createCompositeComponent } from '@tanstack/react-start/rsc'`
- Server-only components render on the server and stream as RSC payloads.
- `createCompositeComponent` lets server components accept client-provided slots (`children`, render-prop functions) for interactive UIs.

Rendering RSCs is out of scope for this skill; see the TanStack Start docs.

## Minimal Diff Summary

A clean RSC upgrade touches exactly these files:

- `package.json` — add `@vitejs/plugin-rsc` to `devDependencies`, and add `esbuild` + `pg` + `isolated-vm` + `quickjs-emscripten` (or other Node-only troublemakers) to `dependencies`.
- `vite.config.ts` — import `rsc`, add it to `plugins`, enable it on `tanstackStart`, and externalize the Node-only packages in both `ssr` and `rsc` environments.
- `netlify.toml` (or equivalent) — `NODE_VERSION = "24"`.

If the diff is bigger than that, something unrelated is creeping in.
