# Favorite-season survey

A one-page favorite-season form using Netlify Forms. It collects a name, a required season selection, and an optional reason. It has no results dashboard, analytics service, accounts, or AI assistant.

## Source and customization

- `src/routes/index.tsx`: SurveyForm mount and page layout.
- `src/components/SurveyForm.tsx`: seasonOptions, fields, POST, and thank-you state.
- `public/form-survey.html`: hidden static registration form.

## Forms and limits

The form name is favorite-season-survey. The component POSTs URL-encoded form-name, name, season, reason, and bot-field to `/form-survey.html`. Keep the registration file synchronized with every submitted field. Netlify form detection must be enabled on the generated site; Vite does not process submissions.

The current handler marks a response as recorded after any resolved fetch. It does not check response.ok, prevent repeated pending submissions, or display network failures. Do not use the thank-you state as evidence of delivery. Consult the netlify-forms-tanstack skill when changing this flow and keep failures honest.

There are no required application environment variables. Replace the question, seasonOptions, labels and thank-you copy in `src/components/SurveyForm.tsx`, registration fields in `public/form-survey.html`, and root metadata.

## Shared structure and development

TanStack Start and React 19 use file routes in `src/routes/`, `src/router.tsx`, and the generated `src/routeTree.gen.ts`. `vite.config.ts` runs Tailwind, the Netlify adapter, Start, and React plugins. The source package pins Vite 7.3.7 and TypeScript 5.9.3; check package.json before changing versions.

Set `siteName` and `siteDescription` in `src/routes/__root.tsx`; these populate page/social metadata. The current defaults are Netlify App and A Netlify web app. Use actual visible headings/content listed above, not an assumed Application Name placeholder or missing Header component. Global CSS is `src/styles.css`. Public files are copied from `public/` into the client output.

Use Node 22.13+ on the Node 22 line, Node 24, or Node 26+. Installed Start packages require at least Node 22.12; Node 22.13 also supports the repository's newer lint/test tooling. Install dependencies from this starter directory, then run:

```bash
npm install --no-package-lock
npm run dev
npm run build
npx --no-install tsc --noEmit
npx --no-install vite preview --host 127.0.0.1
```

Only dev and build are defined in this starter's package.json. The build does not type-check. Run dev/build once before tsc to generate route/content types, and report any failures rather than treating a build as proof of type safety. `netlify.toml` builds with vite build, publishes `dist/client`, and configures the development proxy on 8888 to Vite on 3000. From the repository root, run `npm run smoke -- survey` to build and check the home page; also check changed routes and actions locally.

Loaders run on the server and during client navigation. Use server functions for secrets or server-only work, with runtime `.validator(...)` input validation. Use typed Link destinations/params, and use notFound() for missing records when implementing proper 404 behavior. Browser APIs belong in effects/event handlers, never an SSR render or initial state initializer.

Refresh compatible dependencies and remove unused/duplicate entries when implementing template changes. Check peer requirements and the installed APIs; don't force incompatible major versions. Preserve appearance and working behavior while fixing a specific issue. Do not add persistence, authentication, or external services unless the requested feature needs them.

Shared framework skill source lives under `frameworks/tanstack-start-react/.claude/skills` in this repository, separate from the standalone starter. Consult the named framework/Netlify skills when available in a generated project; do not assume a starter already contains a .claude directory.
