# Analytics dashboard demo

A dashboard displaying sample summary cards and Chart.js bar, line, and doughnut charts. All values are local constants, not live metrics.

## Source and customization

- `src/routes/index.tsx`: mounts Dashboard.
- `src/lib/dashboard.ts`: DashboardData, sampleDashboardData, loadDashboardData, summary calculations, and number formatting.
- `src/components/Dashboard.tsx`: loading, error/retry, empty, and ready states, plus summary cards.
- `src/components/DashboardCharts.tsx`: Chart.js registration, datasets, and chart options.
- `src/components/ChartPanel.tsx`: chart layout and keyboard-accessible data tables.
- `src/styles.css`: base styles; chart/card colors are set in the components.

## Data and limits

SSR renders the heading and loading state. A client effect calls loadDashboardData and renders summaries, charts, and tables after it resolves. Keep browser-dependent chart work behind that boundary. Loading has reduced-motion-safe placeholders; failed requests show an error and Try again button. Cleanup aborts the loader signal and ignores late responses from replaced requests.

The sample is explicitly labeled as illustrative data for January–December 2025. Revenue is the sum of monthly USD revenue; users are a month-end snapshot, so the card takes the final month instead of summing users. Orders sum category counts for the same period. Conversion is orders divided by total monthly visits; zero visits or missing inputs produce Unavailable. Missing arrays produce empty states, while recorded zero values remain zero. There are no invented percentage-change comparisons.

Each chart has a named canvas and a View data disclosure with a captioned table and row/column headers. Category counts of all zero show a no-orders message and their table instead of an empty doughnut. Charts have fixed-height responsive containers and no animation.

To replace the sample, change loadDashboardData in `src/lib/dashboard.ts` to return Promise<DashboardData>, or pass a stable DashboardLoader function to `<Dashboard loadData={loader} />`. A remote loader should pass its AbortSignal to fetch, check response.ok, validate the response, and map it to DashboardData. Do not cast unvalidated JSON to this type. Keep secrets in server-side code. The starter performs no remote request itself.

Keep months in chronological order and give each month a unique display label. Revenue must be finite USD amounts; user, visit, and order counts must be finite nonnegative integers. Category names must be unique. All categories must cover the same period as the monthly rows, and each order must belong to one category. Set isSample to false only when replacing the illustrative values with real data, and set period to the actual reporting period. Cards, charts, and tables derive from the returned object; don't add separate summary constants.

There are no date filters, backend queries, accounts, exports, stored data, or required environment variables. Update Analytics Dashboard in `src/components/Dashboard.tsx`, sample data labels in `src/lib/dashboard.ts`, and root metadata when adapting the demo.

## Shared structure and development

TanStack Start and React 19 use file routes in `src/routes/`, `src/router.tsx`, and the generated `src/routeTree.gen.ts`. `vite.config.ts` runs Tailwind, the Netlify adapter, Start, and React plugins. Check package.json for pinned versions. TypeScript remains on 6 because the Netlify adapter's build tooling uses compiler APIs absent from TypeScript 7.

Set `siteName` and `siteDescription` in `src/routes/__root.tsx`; these populate page/social metadata and describe the sample analytics dashboard. Global CSS is `src/styles.css`. Public files are copied from `public/` into the client output.

Use Node 22.13+ on the Node 22 line, Node 24, or Node 26+. Installed Start packages require at least Node 22.12; Node 22.13 also supports the repository's newer lint/test tooling. Install dependencies from this starter directory, then run:

```bash
npm install --no-package-lock
npm run dev
npm run build
npm run typecheck
npm test
npm run format:check
npx --no-install playwright install chromium
npm run test:browser
npm run preview -- --host 127.0.0.1
```

The build does not type-check. Run dev/build once before typecheck to generate route types. Unit/component tests cover summary formulas, replacement data, loading, error/retry, empty and partial data, zero orders, tables, and cancellation. Component tests mock chart wrappers; Playwright tests use the production build and real charts, check painted canvas pixels at mobile/desktop widths, open tables with the keyboard, and check layout and browser errors. Build before test:browser; it starts its own local preview. PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH can select an existing Chromium binary. CI installs Chromium with its system dependencies and runs both suites.

`netlify.toml` builds with vite build, publishes `dist/client`, and configures the development proxy on 8888 to Vite on 3000. From the repository root, run `npm run smoke -- dashboard` to build and check the server-rendered page. Smoke does not exercise client charts, so also run test:browser. No deployment or live data connection is needed for these checks.

Loaders run on the server and during client navigation. Use server functions for secrets or server-only work, with runtime `.validator(...)` input validation. Use typed Link destinations/params, and use notFound() for missing records when implementing proper 404 behavior. Browser APIs belong in effects/event handlers, never an SSR render or initial state initializer.

Refresh compatible dependencies and remove unused/duplicate entries when implementing template changes. Check peer requirements and the installed APIs; don't force incompatible major versions. Preserve appearance and working behavior while fixing a specific issue. Do not add persistence, authentication, or external services unless the requested feature needs them.

Shared framework skill source lives under `frameworks/tanstack-start-react/.claude/skills` in this repository, separate from the standalone starter. Consult the named framework/Netlify skills when available in a generated project; do not assume a starter already contains a .claude directory.
