# Résumé and CV

A résumé page built from local job and education Markdown, with shadcn/Radix cards, badges, separators, and hover cards. It has no AI assistant, chat endpoint, contact form, or account system.

## Source and customization

- `src/routes/index.tsx`: My Resume heading, career summary, headshot, experience, and education sections.
- `content/jobs/` and `content/education/`: Markdown/frontmatter entries.
- `content-collections.ts`: jobs and education Zod schemas.
- `src/components/ui/`: card, badge, checkbox, separator, and hover-card primitives.
- `public/headshot-on-white.jpg`: sample headshot.

## Content and limits

Job fields include jobTitle, summary, company, location, startDate, optional endDate, tags, and content. Education fields include school, summary, startDate, optional endDate, tags, and content. Dates are strings; entries render in generated collection order, not an explicit chronological sort.

Run dev/build to generate `.content-collections/`. Generated imports need a TypeScript path to that directory; the current starter does not configure it. The date/tag display and Markdown renderers use the generated values directly. Sanitize Markdown HTML before allowing untrusted authors. There is no editor, export, stored user data, or required environment variable.

Replace My Resume, career summary, headshot/alt text in `src/routes/index.tsx`, Markdown entries, and root metadata. Check long names, summaries, and narrow-screen layouts when adapting the page.

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

Only dev and build are defined in this starter's package.json. The build does not type-check. Run dev/build once before tsc to generate route/content types, and report any failures rather than treating a build as proof of type safety. `netlify.toml` builds with vite build, publishes `dist/client`, and configures the development proxy on 8888 to Vite on 3000. From the repository root, run `npm run smoke -- resume` to build and check the home page; also check changed routes and actions locally.

Loaders run on the server and during client navigation. Use server functions for secrets or server-only work, with runtime `.validator(...)` input validation. Use typed Link destinations/params, and use notFound() for missing records when implementing proper 404 behavior. Browser APIs belong in effects/event handlers, never an SSR render or initial state initializer.

Refresh compatible dependencies and remove unused/duplicate entries when implementing template changes. Check peer requirements and the installed APIs; don't force incompatible major versions. Preserve appearance and working behavior while fixing a specific issue. Do not add persistence, authentication, or external services unless the requested feature needs them.

Shared framework skill source lives under `frameworks/tanstack-start-react/.claude/skills` in this repository, separate from the standalone starter. Consult the named framework/Netlify skills when available in a generated project; do not assume a starter already contains a .claude directory.
