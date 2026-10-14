---
name: tanstack-start-routes
description: Create and manage routes in TanStack Start using file-based routing. Use when adding new pages, configuring layouts, setting up nested routes, or working with route parameters.
license: Apache-2.0
metadata:
  author: tanstack
  version: "1.0"
---

# File routes and layouts

Pages live in src/routes and export Route from createFileRoute. Keep the existing root shell, metadata, providers, and styles. Run dev/build to generate src/routeTree.gen.ts after adding or moving routes; don't edit that generated file.

## Root document

This complete shell keeps document markup outside route errors and renders matched content through children. A route component used as a layout must render Outlet for its child routes.

```tsx file=src/routes/__root.tsx
import { createRootRoute, HeadContent, Link, Scripts } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import '../styles.css'

export const Route = createRootRoute({
  head: () => ({ meta: [
    { charSet: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { title: 'Example site' },
    { name: 'description', content: 'A small example site.' },
  ] }),
  shellComponent: RootDocument,
  notFoundComponent: () => <main><h1>Page not found</h1><Link to="/">Go home</Link></main>,
})

function RootDocument({ children }: { children: ReactNode }) {
  return <html lang="en"><head><HeadContent /></head><body>{children}<Scripts /></body></html>
}
```

Register a safe defaultErrorComponent in the router as shown in the project-setup skill. A root route's errorComponent alone does not supply the fallback used by child SSR loader failures.

## Page and pathless layout

Each file block below is a complete module. File paths are relative to a generated app; create them before linking to their routes.

```tsx file=src/routes/about.tsx
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  head: () => ({ meta: [{ title: 'About | Example site' }, { name: 'description', content: 'About this example.' }] }),
  component: () => <main><h1>About</h1><Link to="/">Home</Link></main>,
})
```

```tsx file=src/routes/_workspace.tsx
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_workspace')({
  component: () => <section aria-label="Workspace"><Outlet /></section>,
})
```

```tsx file=src/routes/_workspace.notes.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_workspace/notes')({
  component: () => <main><h1>Notes</h1></main>,
})
```

## Names and URLs

| File | URL / behavior |
| --- | --- |
| index.tsx | / |
| about.tsx | /about |
| items.$itemId.tsx | /items/:itemId |
| posts.tsx | /posts layout, needs Outlet |
| posts.index.tsx | /posts index; file route ID /posts/ |
| posts.$postId.tsx | /posts/:postId inside the posts layout |
| _workspace.tsx | pathless layout; not an auth boundary |
| _workspace.notes.tsx | /notes inside that layout |
| files.$.tsx | /files/*; read params._splat |
| api.hello.ts | /api/hello using server.handlers |

Flat and directory routes can be mixed. A directory's route.tsx supplies its layout. Route groups in parentheses organize files without adding URL segments. A trailing underscore opts a route out of normal parent nesting. Consult generated route IDs rather than inventing paths.

Use params.parse/params.stringify only when the installed router supports them and runtime-check converted values. For ordinary string parameters, Route.useParams() and explicit loader validation are enough. Use throw notFound() for a missing record, not a generic Error. Keep generic unexpected failures on the error path. Add route-specific head() titles/descriptions when adapting content pages.
