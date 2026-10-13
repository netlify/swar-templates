# Markdown blog

A travel-blog example backed by local Markdown and Content Collections. It has a post index, category pages, and post detail pages. It has no CMS, authentication, comments, or AI assistant.

## Source and customization

- `content/posts/`: Markdown entries and frontmatter.
- `content-collections.ts`: `posts` schema and title-derived slug transform. Fields include title, summary, categories, image, date, and content. The transform currently replaces a supplied slug; changing a title changes its URL.
- `src/routes/index.tsx`: Your Blog heading and post index.
- `src/components/blog-posts.tsx`: shared index/category list.
- `src/routes/posts.$slug.tsx`: detail loader and Markdown rendering.
- `src/routes/category.$category.tsx`: category filtering.
- `vite.config.ts`: Content Collections plugin before the Start plugin.

## Content and limits

Run dev or build to generate `.content-collections/`. Import `allPosts` and generated types from `content-collections`; the schema uses `z.object(...)`, not a schema callback. Keep schema fields and frontmatter consistent. Generated imports also need a TypeScript path to the generated directory before type checking; the current starter does not configure that path.

Dates are content strings; use a consistent format and deliberate sorting. Unknown posts currently throw a generic error rather than `notFound()`. Markdown is rendered with `marked` and `dangerouslySetInnerHTML`; treat repository content as trusted author content, and sanitize before accepting untrusted HTML. There is no server data store or required environment variable.

Replace Your Blog in `src/routes/index.tsx`, the entries under `content/posts/`, and the root metadata when adapting the site.

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

Only dev and build are defined in this starter's package.json. The build does not type-check. Run dev/build once before tsc to generate route/content types, and report any failures rather than treating a build as proof of type safety. `netlify.toml` builds with vite build, publishes `dist/client`, and configures the development proxy on 8888 to Vite on 3000. From the repository root, run `npm run smoke -- blog` to build and check the home page; also check changed routes and actions locally.

Loaders run on the server and during client navigation. Use server functions for secrets or server-only work, with runtime `.validator(...)` input validation. Use typed Link destinations/params, and use notFound() for missing records when implementing proper 404 behavior. Browser APIs belong in effects/event handlers, never an SSR render or initial state initializer.

Refresh compatible dependencies and remove unused/duplicate entries when implementing template changes. Check peer requirements and the installed APIs; don't force incompatible major versions. Preserve appearance and working behavior while fixing a specific issue. Do not add persistence, authentication, or external services unless the requested feature needs them.

Shared framework skill source lives under `frameworks/tanstack-start-react/.claude/skills` in this repository, separate from the standalone starter. Consult the named framework/Netlify skills when available in a generated project; do not assume a starter already contains a .claude directory.
