---
name: tanstack-start-typesafe-routing
description: Implement type-safe navigation and links in TanStack Start. Use when creating links, navigating programmatically, working with search params, or accessing route parameters with full TypeScript support.
license: Apache-2.0
metadata:
  author: tanstack
  version: "1.0"
---

# Type-safe navigation

Register ReturnType<typeof getRouter> in @tanstack/react-router's Register interface. Generate route types through dev/build before type checking. Without registration or generated routes, valid-looking navigation code may not have the route checks you expect.

Use Link with a route pattern and params, for example to="/items/$itemId" and params={{ itemId: 'example' }}, not an interpolated string. Use a normal anchor for external destinations and hash="section-id" for internal section links. A typed path must correspond to a route file that exists.

## Complete searchable list

This module uses getItems from the server-functions skill and links to the detail route from the loaders skill. Search is validated at runtime; pagination changes preserve the query and trigger the loader through loaderDeps.

```tsx file=src/routes/search.tsx
import { createFileRoute, Link } from '@tanstack/react-router'
import { getItems } from '@/lib/items.functions'

export const Route = createFileRoute('/search')({
  validateSearch: (input: Record<string, unknown>) => {
    const page = Number(input.page)
    return {
      q: typeof input.q === 'string' ? input.q.slice(0, 100) : '',
      page: Number.isSafeInteger(page) && page > 0 ? page : 1,
    }
  },
  loaderDeps: ({ search }) => ({ q: search.q, page: search.page }),
  loader: async ({ deps }) => {
    const items = await getItems()
    const matches = items.filter((item) => item.name.toLowerCase().includes(deps.q.toLowerCase()))
    return { items: matches.slice((deps.page - 1) * 10, deps.page * 10), total: matches.length }
  },
  component: SearchPage,
})

function SearchPage() {
  const search = Route.useSearch()
  const { items, total } = Route.useLoaderData()
  const navigate = Route.useNavigate()
  return <main>
    <h1>Search</h1>
    <label>Search items<input value={search.q} onChange={(event) => {
      void navigate({ search: (previous) => ({ ...previous, q: event.target.value, page: 1 }), replace: true })
    }} /></label>
    {items.length === 0 && <p>No matching items.</p>}
    <ul>{items.map((item) => <li key={item.id}><Link to="/items/$itemId" params={{ itemId: item.id }}>{item.name}</Link></li>)}</ul>
    <button disabled={search.page === 1} onClick={() => { void navigate({ search: (previous) => ({ ...previous, page: previous.page - 1 }) }) }}>Previous</button>
    <button disabled={search.page * 10 >= total} onClick={() => { void navigate({ search: (previous) => ({ ...previous, page: previous.page + 1 }) }) }}>Next</button>
  </main>
}
```

Use Route.useSearch(), Route.useParams(), and Route.useNavigate() in route components. For shared components, hooks with a from route ID retain type information. Runtime checks still matter: a cast to string or number does not validate an untrusted URL.

Active links can set activeProps/inactiveProps and activeOptions={{ exact: true }}; exact is an active-link option, not a general route type. Preserve search values with a search updater rather than dropping required values. Use replace for changes that should not add browser history entries. Back/forward navigation uses router.history.back(), forward(), or go().

For breadcrumbs with already-resolved arbitrary pathnames, a normal anchor can be appropriate; do not cast a pathname to a registered route pattern merely to silence TypeScript. Do not navigate during render. Use an event handler, an effect for client-only state, or beforeLoad for a route guard.
