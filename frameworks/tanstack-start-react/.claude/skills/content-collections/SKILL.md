---
name: content-collections
description: Use content-collections for type-safe content management with markdown files. Use when building blogs, documentation sites, or any content-driven pages with frontmatter and markdown.
---

# Content Collections with TanStack Start

Use this for repository-authored Markdown/frontmatter content. It is a build-time content pipeline, not a runtime database, CMS, or user-upload store. Preserve the starter's collection names, schema fields, and existing content when extending it.

## Dependencies and schema

The content starters pin @content-collections/core 0.13.1, @content-collections/vite 0.2.9, and Zod 4. Check installed versions and peers when upgrading. For an app without these packages, install compatible core/Vite packages and zod before using the examples.

schema takes a Standard Schema object, such as z.object(...), not the old schema: (z) => ({ ... }) callback. Declare content when the transform or page needs the Markdown body.

```ts file=content-collections.ts
import { defineCollection, defineConfig } from '@content-collections/core'
import { z } from 'zod'

const posts = defineCollection({
  name: 'posts',
  directory: 'content/posts',
  include: '**/*.md',
  schema: z.object({
    title: z.string().min(1),
    date: z.string(),
    summary: z.string().default(''),
    content: z.string(),
  }),
  transform: (document) => ({ ...document, slug: document._meta.path }),
})

export default defineConfig({ collections: [posts] })
```

```md file=content/posts/welcome.md
---
title: Welcome
date: "2026-01-15"
summary: A short example entry.
---

This is the Markdown body.
```

Quote date frontmatter when the schema expects a string. _meta.path is the content-relative path without the extension, so moving a file changes the example slug. Nested paths need a matching route shape; a single $slug segment does not capture an arbitrary slash-separated path. A title-derived slug transform may change URLs when copy changes, so choose one policy deliberately.

## Vite and TypeScript

Add contentCollections() before tanstackStart() in the existing vite.config.ts. This complete alternative configuration demonstrates the integration and can be run with vite build --config vite.content.config.ts; merge its plugin into the app's existing config rather than maintaining two configs in a product.

```ts file=vite.content.config.ts
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import netlify from '@netlify/vite-plugin-tanstack-start'
import contentCollections from '@content-collections/vite'

export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  plugins: [contentCollections(), tailwindcss(), netlify(), tanstackStart(), react()],
})
```

Merge this path into compilerOptions.paths in tsconfig.json while preserving the existing @/* path:

```json merge=tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "content-collections": ["./.content-collections/generated"],
      "@/*": ["./src/*"]
    }
  }
}
```

Run dev/build before tsc so the generated module exists. The Vite plugin resolves runtime imports; the TypeScript path resolves the generated types. Both are needed. Do not hand-edit generated files or claim the build performs the separate type check.

## Complete content routes

```tsx file=src/routes/articles.tsx
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/articles')({ component: Outlet })
```

```tsx file=src/routes/articles.index.tsx
import { createFileRoute, Link } from '@tanstack/react-router'
import { allPosts } from 'content-collections'

export const Route = createFileRoute('/articles/')({
  loader: () => [...allPosts].sort((a, b) => b.date.localeCompare(a.date)),
  component: ArticlesPage,
})

function ArticlesPage() {
  const posts = Route.useLoaderData()
  return <main><h1>Articles</h1><ul>{posts.map((post) => (
    <li key={post._meta.path}><Link to="/articles/$slug" params={{ slug: post.slug }}>{post.title}</Link></li>
  ))}</ul></main>
}
```

```tsx file=src/routes/articles.$slug.tsx
import { createFileRoute, notFound } from '@tanstack/react-router'
import { allPosts } from 'content-collections'

export const Route = createFileRoute('/articles/$slug')({
  loader: ({ params }) => {
    const post = allPosts.find((entry) => entry.slug === params.slug)
    if (!post) throw notFound()
    return post
  },
  component: ArticlePage,
})

function ArticlePage() {
  const post = Route.useLoaderData()
  return <main><h1>{post.title}</h1><time>{post.date}</time><pre>{post.content}</pre></main>
}
```

The detail example deliberately displays raw Markdown as text. Content Collections does not create an html field automatically. To render HTML, add a compatible Markdown compiler/renderer and an explicit transform; sanitize before rendering untrusted HTML. Do not enable raw HTML by default or use dangerouslySetInnerHTML on untrusted content.

Use [...collection].sort(...) so imports remain unchanged. JSON/YAML collections need the corresponding parser supported by the installed core; do not assume include: '**/*.json' alone selects a parser. For multiple collections and joins, preserve schema inference and check the installed Context API before using it.
