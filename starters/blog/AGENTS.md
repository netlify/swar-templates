# Markdown blog

A blog backed by local Markdown and Content Collections, with a newest-first index, category navigation, article pages, and proper 404 responses. It has no CMS, authentication, comments, or AI assistant.

## Source and customization

- `content/posts/`: Markdown entries and frontmatter.
- `content-collections.ts`: collection configuration, normalized images/categories, generated HTML, and duplicate-slug validation.
- `src/lib/post-content.ts`: frontmatter schema, filename-derived fallback slugs, Markdown rendering, and HTML sanitization. Used at build time, not in the browser.
- `src/lib/blog.ts`: newest-first sorting, category discovery, UTC date display, and post lookup with `notFound()`.
- `src/lib/site.ts`: blog name and description, shared by visible navigation and page/social metadata.
- `src/routes/index.tsx`: blog heading, categories, and post index.
- `src/components/blog-posts.tsx`: shared index/category list.
- `src/routes/posts.$slug.tsx`: detail loader and Markdown rendering.
- `src/routes/category.$category.tsx`: category filtering.
- `src/components/category-links.tsx`: typed category links, with an announced current category.
- `src/routes/__root.tsx`: shared home link, skip link, metadata, and not-found page.
- `vite.config.ts`: Content Collections plugin before the Start plugin.

## Content and limits

Run dev or build to generate `.content-collections/`. Import `allPosts` and the generated `Post` type from `content-collections`; `tsconfig.json` maps that import to `.content-collections/generated`. Do not edit or commit generated content or `src/routeTree.gen.ts`. Content Collections uses `content: [posts]` and a Zod object schema.

Frontmatter requires nonempty `title` and `summary`, plus a valid calendar `date` in quoted `YYYY-MM-DD` format. `categories` is an optional list of nonempty names; it defaults to an empty list. Optional `image` accepts a public image path or HTTPS URL, and optional `imageAlt` describes it (use an empty string for decorative images). Relative public paths such as `placeholder.png` become `/placeholder.png`, so images work on article and category routes too.

An explicit `slug` is preserved exactly. It must be a single URL segment containing letters, numbers, hyphens, or underscores, without spaces or leading/trailing separators. Without one, the relative filename without its extension becomes a lowercase hyphenated slug, including parent folders. Editing the title does not change this fallback, but renaming the file does; set an explicit slug before renaming a published file. Duplicate explicit/fallback slugs fail the build and identify both files. Existing sites migrating from title-derived URLs should set those old slugs explicitly, as the sample post does.

Markdown is converted with `marked` and sanitized with `sanitize-html` at build time. Articles render only the generated `html`; scripts, event handlers, and unsafe URL schemes are removed. Tailwind Typography styles headings, lists, quotes, code, tables, and links. Keep sanitization when extending allowed Markdown/HTML features.

Index and category lists sort newest first, with slugs breaking date ties. Dates display in UTC to avoid changing calendar days between server and browser. Empty blogs/categories show useful messages; unknown articles/pages return HTTP 404 with a home link. Article metadata uses the title, summary, publication date, and categories. There is no server data store or required environment variable.

Set the product name and description in `src/lib/site.ts`, and replace the entries under `content/posts/` when adapting the site. Category names are exact and case-sensitive; reuse the same spelling across posts.

## Shared structure and development

TanStack Start and React 19 use file routes in `src/routes/`, `src/router.tsx`, and the generated `src/routeTree.gen.ts`. `vite.config.ts` runs Content Collections before Start, along with Tailwind, the Netlify adapter, and React. The source package pins Vite 8.3.4 and TypeScript 6.0.3; the current Netlify adapter dependency path is incompatible with TypeScript 7's compiler API.

Global CSS and the typography plugin are configured in `src/styles.css`. Public files are copied from `public/` into the client output. Reusable card primitives are in `src/components/ui/card.tsx`; the blog list uses native articles and typed links.

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

The build does not type-check. Run dev/build once before typecheck to generate route/content types, and report failures rather than treating a build as proof of type safety. Tests cover slugs, real collection generation, duplicate rejection, Markdown sanitization, dates, sorting, and missing posts. `netlify.toml` builds with vite build, publishes `dist/client`, and configures the development proxy on 8888 to Vite on 3000. From the repository root, run `npm run smoke -- blog`; also check article/category links, missing routes, images, and typography locally. CI runs the blog's type-check, format check, and tests after the smoke build.

Loaders run on the server and during client navigation. Use server functions for secrets or server-only work, with runtime `.validator(...)` input validation. Use typed Link destinations/params, and use notFound() for missing records when implementing proper 404 behavior. Browser APIs belong in effects/event handlers, never an SSR render or initial state initializer.

Refresh compatible dependencies and remove unused/duplicate entries when implementing template changes. Check peer requirements and the installed APIs; don't force incompatible major versions. Preserve appearance and working behavior while fixing a specific issue. Do not add persistence, authentication, or external services unless the requested feature needs them.

Shared framework skill source lives under `frameworks/tanstack-start-react/.claude/skills` in this repository, separate from the standalone starter. Consult the named framework/Netlify skills when available in a generated project; do not assume a starter already contains a .claude directory.
