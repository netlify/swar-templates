# Portfolio, blog, and résumé

A developer portfolio with a portfolio home page, selected work, résumé, blog, and Netlify Forms contact page. Shared navigation joins all pages. Local Markdown is built into Content Collections. The default identity and content are examples; there is no AI assistant or account system.

## Source and customization

- `content/blog/`, `content/projects/`, `content/jobs/`, and `content/education/`: editable Markdown/frontmatter.
- `src/lib/site.ts`: identity, role, summary, and shared page/social metadata.
- `content-collections.ts` and `src/lib/content.ts`: schemas, slug resolution, and sanitized build-time Markdown transforms.
- `src/lib/chronology.ts`: experience/post ordering and UTC date formatting.
- `src/components/SiteHeader.tsx`: navigation to Home, Work, Résumé, Blog, and Contact.
- `src/routes/index.tsx`: portfolio introduction, featured projects, and latest posts.
- `src/routes/blog/index.tsx`: blog index at `/blog`, newest first.
- `src/routes/blog/$slug.tsx`: blog loader, per-post metadata, and notFound handling.
- `src/routes/projects.tsx`: project cards, images, Markdown, and optional external links.
- `src/routes/resume.tsx`: work/education content.
- `src/routes/contact.tsx` and `src/components/ContactForm.tsx`: contact page and submission states.
- `public/contact.html`: static Netlify Forms registration for contact.

## Content, forms, and limits

Run dev/build to generate `.content-collections/`. The Content Collections configuration uses content, with Zod schemas and build-time HTML transforms. tsconfig maps content-collections to `.content-collections/generated`. Generated files stay ignored; do not hand-edit them. Markdown is parsed synchronously with marked and sanitized before it reaches the browser. Tailwind Typography styles prose on posts, projects, experience, and education. Keep this boundary when adding content sources.

Blog URLs use an optional explicit slug, otherwise a normalized filename path. Existing flat filenames keep their URLs; nested paths become a single hyphenated URL segment. Set an explicit slug to preserve a URL while moving/renaming content. Duplicate slugs fail the build with both source filenames. Missing posts/pages return HTTP 404 through the shared not-found page.

Use quoted YYYY-MM-DD calendar dates. Jobs and education sort current entries first, then newest start date, end date, and source path to break ties; omit endDate for an ongoing entry. Users should not need hover interactions to read skills. Blog posts sort by date descending, then slug. Dates format in UTC to avoid moving by a day between server and client.

Projects support title, description, tags, optional github/liveUrl HTTP(S) links, optional image, optional imageAlt, and a Markdown body. Images can use a public path such as `/project-preview.svg` or an HTTPS URL. Relative public paths are normalized to root paths; add descriptive imageAlt when using an image. The sample includes a local illustration and rendered Markdown, and omits fake source/demo destinations. Keep external links optional.

The contact form POSTs URL-encoded name, email, message, form-name, and bot-field to `/contact.html`. Keep these fields and the contact form name synchronized with `public/contact.html`. Netlify form detection must be enabled on the generated site. Pending requests disable inputs and block duplicate submissions. HTTP errors, network failures, and a 15-second timeout preserve inputs for retry. The handler checks response.ok and rejects unprocessed registration HTML before reporting success, so a plain local preview's HTTP 200 is not proof of delivery. Acceptance does not prove an email notification or downstream delivery. Do not deploy or send live form submissions for testing without explicit authorization.

There are no required application environment variables. Replace the example identity in `src/lib/site.ts`, local Markdown, project images, optional external links, and route copy. The homepage links selected work and recent posts; shared navigation remains available on detail and not-found pages. Empty collections display empty states.

## Shared structure and development

TanStack Start and React 19 use file routes in `src/routes/`, `src/router.tsx`, and the generated `src/routeTree.gen.ts`. `vite.config.ts` runs Content Collections, Tailwind, the Netlify adapter, Start, and React plugins. Check package.json for pinned versions. TypeScript remains on 6 because the Netlify adapter's build tooling uses compiler APIs absent from TypeScript 7.

Set identity and base metadata in `src/lib/site.ts`. Routes use pageMeta for titles and descriptions, and posts use the loaded content. The root shell provides shared navigation, a skip link, and the main landmark. Global CSS is `src/styles.css`. Public files are copied from `public/` into the client output.

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

The build does not type-check. Run dev/build once before typecheck to generate route/content types. Tests mock contact delivery and cover accepted responses, HTTP rejection, network failure, pending duplicates, timeout, retry, preview HTML, and static registration. Content tests cover Markdown/sanitization, schemas, slugs/collisions, chronology, and date formatting. `netlify.toml` builds with vite build, publishes `dist/client`, and configures the development proxy on 8888 to Vite on 3000. From the repository root, run `npm run smoke -- portfolio` to build and check the home page. Also check shared navigation, post 404s, project images/Markdown, résumé order, metadata, contact interactions, and narrow layouts in a local browser.

Loaders run on the server and during client navigation. Use server functions for secrets or server-only work, with runtime `.validator(...)` input validation. Use typed Link destinations/params, and use notFound() for missing records when implementing proper 404 behavior. Browser APIs belong in effects/event handlers, never an SSR render or initial state initializer.

Refresh compatible dependencies and remove unused/duplicate entries when implementing template changes. Check peer requirements and the installed APIs; don't force incompatible major versions. Preserve appearance and working behavior while fixing a specific issue. Do not add persistence, authentication, or external services unless the requested feature needs them.

Shared framework skill source lives under `frameworks/tanstack-start-react/.claude/skills` in this repository, separate from the standalone starter. Consult the named framework/Netlify skills when available in a generated project; do not assume a starter already contains a .claude directory.
