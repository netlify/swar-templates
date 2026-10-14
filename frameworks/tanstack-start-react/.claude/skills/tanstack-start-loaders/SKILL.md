---
name: tanstack-start-loaders
description: Load data for TanStack Start routes using beforeLoad and loader functions. Use when fetching data for pages, implementing route guards, or setting up route context. IMPORTANT - Loaders should call server functions for data access.
license: Apache-2.0
metadata:
  author: tanstack
  version: "1.0"
---

# Loaders and route context

beforeLoad and loader run during SSR and client navigation. Call server functions for secrets, database access, or server-only APIs; don't read credentials or query a database directly from an isomorphic loader. Public local content and browser-safe data can be loaded directly.

beforeLoad runs parent to child and contributes context. Matched loaders can run in parallel after guards complete. A beforeLoad UI redirect is not authorization for a server function or API handler.

## Complete detail page

This uses getItem from the complete server-functions example. Create that module first or substitute an existing real server function with the same validated input shape.

```tsx file=src/routes/items.$itemId.tsx
import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { getItem } from '@/lib/items.functions'

export const Route = createFileRoute('/items/$itemId')({
  loader: async ({ params }) => {
    const item = await getItem({ data: { id: params.itemId } })
    if (!item) throw notFound()
    return item
  },
  pendingComponent: () => <p role="status">Loading item…</p>,
  component: ItemPage,
})

function ItemPage() {
  const item = Route.useLoaderData()
  return <main><h1>{item.name}</h1><Link to="/">Home</Link></main>
}
```

Missing records use notFound(); the router's safe default error component handles unexpected failures. Do not render arbitrary error.message values. Root/global error pages must cover child SSR failures too.

## Search, navigation, and caching

Validate search values at runtime before using them. Declare every search value used by a loader in loaderDeps and read deps in the loader; otherwise a changed query parameter may reuse the wrong cached data. The complete search route in the typesafe-routing skill demonstrates this pattern.

When a guard needs the intended destination, use the location supplied to beforeLoad, not the browser's global location, which is absent during SSR. Verify a return destination is a local allowed path before redirecting to it. Authentication-specific examples are in the Identity integration skill.

Use staleTime, preloadStaleTime, and gcTime deliberately for the data's freshness requirements. After a successful mutation, await router.invalidate() to reload affected route data. Do not claim a mutation succeeded before its request finishes.

For deferred data, return a promise only for noncritical data and render it through React Suspense and Router Await with an accessible fallback. Import both explicitly. Attach error handling as the promise is created so a rejection cannot become unhandled before rendering.

TanStack Query is optional. When used, create its QueryClient per router/request, declare root context, configure SSR dehydration/hydration, and use ensureQueryData in loaders with the same query options as the component. Don't assume Query is installed or that a provider alone transfers SSR data.
