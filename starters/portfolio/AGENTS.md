# Portfolio, blog, and résumé

A developer portfolio with a blog home page, projects, résumé, and Netlify Forms contact page. Local Markdown is built into Content Collections. There is no AI assistant or account system.

## Source and customization

- `content/blog/`, `content/projects/`, `content/jobs/`, and `content/education/`: editable Markdown/frontmatter.
- `content-collections.ts`: blog, projects, jobs, and education schemas.
- `src/routes/index.tsx`: blog index, sorted by date.
- `src/routes/blog/$slug.tsx`: blog detail lookup and Markdown.
- `src/routes/projects.tsx`: project cards and external links.
- `src/routes/resume.tsx`: work/education content.
- `src/routes/contact.tsx`: contact form.
- `public/contact.html`: static Netlify Forms registration for contact.

## Content, forms, and limits

Run dev/build to generate `.content-collections/`. The schemas use Zod objects. Generated imports need a TypeScript path to that generated directory; it is not configured in the current starter. Blog URLs use `_meta.path`, so moving/renaming a Markdown file changes its URL. Keep nested paths consistent with the route shape. Raw Markdown is rendered through `marked`; sanitize before accepting untrusted content.

The contact form POSTs URL-encoded name, email, message, form-name, and bot-field to `/contact.html`. Keep these fields and the contact form name synchronized with `public/contact.html`. Netlify form detection must be enabled on the generated site. Vite alone does not deliver submissions. The current handler shows Message Sent after any resolved fetch, including non-2xx responses; it does not yet check response.ok or show network errors. Do not treat that state as proof of delivery.

There are no required application environment variables. Replace content, external project URLs, visible route copy, and root metadata. Verify navigation between blog, projects, résumé, and contact; the routes are not joined by a shared header in this starter.

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

Only dev and build are defined in this starter's package.json. The build does not type-check. Run dev/build once before tsc to generate route/content types, and report any failures rather than treating a build as proof of type safety. `netlify.toml` builds with vite build, publishes `dist/client`, and configures the development proxy on 8888 to Vite on 3000. From the repository root, run `npm run smoke -- portfolio` to build and check the home page; also check changed routes and actions locally.

Loaders run on the server and during client navigation. Use server functions for secrets or server-only work, with runtime `.validator(...)` input validation. Use typed Link destinations/params, and use notFound() for missing records when implementing proper 404 behavior. Browser APIs belong in effects/event handlers, never an SSR render or initial state initializer.

Refresh compatible dependencies and remove unused/duplicate entries when implementing template changes. Check peer requirements and the installed APIs; don't force incompatible major versions. Preserve appearance and working behavior while fixing a specific issue. Do not add persistence, authentication, or external services unless the requested feature needs them.

Shared framework skill source lives under `frameworks/tanstack-start-react/.claude/skills` in this repository, separate from the standalone starter. Consult the named framework/Netlify skills when available in a generated project; do not assume a starter already contains a .claude directory.
