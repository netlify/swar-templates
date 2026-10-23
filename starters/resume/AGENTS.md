# Résumé and CV

A résumé page built from a structured profile and local job/education Markdown, with cards, badges, accessible skill lists, and browser printing. It has no AI assistant, chat endpoint, contact form, or account system.

## Source and customization

- `content/profile.json`: name, headline, summary, optional location/email/phone/photo, contact links, and profile skills. Example contact details are placeholders; replace or omit them before publishing.
- `src/lib/profile.ts`: profile validation, inferred type, and page title. Metadata uses the same profile as the visible page.
- `src/routes/index.tsx`: loads the generated collections and profile into the resume.
- `src/components/Resume.tsx`: profile/contact links, summary/photo, experience, education, skill lists, and print control.
- `content/jobs/` and `content/education/`: Markdown/frontmatter entries.
- `content-collections.ts` and `src/lib/resume-content.ts`: jobs/education schemas and build-time sanitized Markdown HTML.
- `src/lib/chronology.ts`: deliberate sorting and UTC month/year date formatting.
- `src/styles.css`: theme, Markdown typography, responsive layout, and print styles.
- `src/components/ui/`: card, badge, checkbox, separator, and hover-card primitives.
- `public/headshot-on-white.jpg`: sample headshot.

## Content and limits

Profile name, headline, and summary are required. Contact fields and photo are optional; links/skills default to empty lists. Links accept HTTP(S), email becomes a mailto link, and phone becomes a tel link. Photo paths can be public absolute paths such as `/headshot-on-white.jpg` or HTTP(S) URLs. Supply descriptive photo alt text, or an empty string for decorative photos. Omit unused optional fields rather than leaving empty placeholders.

Jobs require jobTitle, summary, company, startDate, and Markdown content; location/endDate are optional and tags default to an empty list. Education requires school, summary, startDate, and Markdown content; endDate is optional and tags default to an empty list. Use quoted valid `YYYY-MM-DD` dates; endDate must not precede startDate. Omit endDate for an ongoing role/program, rendered as Present.

Both collections show ongoing entries first, then newest start dates, newest end dates, and file paths to break ties. Sorting does not change the generated arrays. React keys use `_meta.path`, so repeated job titles or school names remain separate records. Dates, summary, tags, and sanitized Markdown are displayed consistently for both collections. Skills are visible lists, not hover-only content or invented experience descriptions.

Run dev/build to generate `.content-collections/`. `tsconfig.json` maps `content-collections` to `.content-collections/generated` for exported values and types. Do not edit/commit generated content or `src/routeTree.gen.ts`. Content Collections uses `content: [jobs, education]`. Markdown is compiled with marked and sanitized with sanitize-html during the build; the page renders generated `html`, not raw Markdown. Keep sanitization when extending content support. There is no editor, stored user data, or required environment variable.

Change profile/contact data in `content/profile.json` and the Markdown entries when adapting the page. The Print resume button calls the browser print dialog; choose Save as PDF there if needed. Print styles remove controls, borders, and shadows, keep contact URLs readable, use a light background, and avoid splitting normal-sized entries. Long entries can span pages. Check both narrow screens and the printed result after changing content.

## Shared structure and development

TanStack Start and React 19 use file routes in `src/routes/`, `src/router.tsx`, and the generated `src/routeTree.gen.ts`. `vite.config.ts` runs Content Collections before Start, alongside Tailwind, the Netlify adapter, and React. The source package pins Vite 8.3.5 and TypeScript 6.0.3; the current Netlify adapter dependency path is incompatible with TypeScript 7's compiler API.

`src/routes/__root.tsx` uses the profile's name/headline for page/social titles and summary for descriptions. Public files are copied from `public/` into the client output. Existing checkbox and hover-card primitives remain available, but the resume does not use interactive controls for static skill labels.

Use Node 22.13+ on the Node 22 line, Node 24, or Node 26+. Installed Start packages require at least Node 22.12; Node 22.13 also supports the repository's newer lint/test tooling. Install dependencies from this starter directory, then run:

```bash
npm install --no-package-lock
npm run dev
npm run build
npm run typecheck
npm test
npm run format:check
npm run preview -- --host 127.0.0.1
```

The build does not type-check. Run dev/build once before typecheck to generate route/content types, and report failures rather than treating a build as proof of type safety. Tests cover profile validation, contact links, dates, sorting, repeated titles/stable keys, skill lists, sanitization, and the print action. `netlify.toml` builds with vite build, publishes `dist/client`, and configures the development proxy on 8888 to Vite on 3000. From the repository root, run `npm run smoke -- resume`; also check mobile layout and browser printing locally. CI runs type-checking, formatting, and tests after the smoke build.

Loaders run on the server and during client navigation. Use server functions for secrets or server-only work, with runtime `.validator(...)` input validation. Use typed Link destinations/params, and use notFound() for missing records when implementing proper 404 behavior. Browser APIs belong in effects/event handlers, never an SSR render or initial state initializer.

Refresh compatible dependencies and remove unused/duplicate entries when implementing template changes. Check peer requirements and the installed APIs; don't force incompatible major versions. Preserve appearance and working behavior while fixing a specific issue. Do not add persistence, authentication, or external services unless the requested feature needs them.

Shared framework skill source lives under `frameworks/tanstack-start-react/.claude/skills` in this repository, separate from the standalone starter. Consult the named framework/Netlify skills when available in a generated project; do not assume a starter already contains a .claude directory.
