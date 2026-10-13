# Server data

Use a route loader for data needed to render a page. Use a server function when that loader or a component needs server-only configuration, credentials, or APIs. Server-function input is public input: validate it at runtime with `.validator(...)`.

This example requires you to configure `ITEMS_API_URL` with your own server's absolute URL. It doesn't add a data source to Basic.

```ts
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

const itemsSchema = z.array(z.object({ id: z.string(), name: z.string() }))

export const getItems = createServerFn({ method: 'GET' }).handler(async () => {
  const url = process.env.ITEMS_API_URL
  if (!url) throw new Error('ITEMS_API_URL is required')

  const response = await fetch(url)
  if (!response.ok) throw new Error('Could not load items')
  return itemsSchema.parse(await response.json())
})
```

Put the server function in `src/lib/items.functions.ts`. A page can then use:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { getItems } from '@/lib/items.functions'

export const Route = createFileRoute('/items')({
  loader: () => getItems(),
  pendingComponent: () => <p role="status">Loading items…</p>,
  component: ItemsPage,
})

function ItemsPage() {
  const items = Route.useLoaderData()
  if (items.length === 0) return <p>No items yet.</p>
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  )
}
```

Create `src/routes/items.tsx` when using this example. The root route already handles unexpected loader failures and offers retry. For detail pages, use `throw notFound()` for missing records. Replace a text loading state with local Skeleton components when the content layout is known.

Keep secrets in server code; don't expose them in loader return values or `VITE_*` variables. Use absolute URLs for server-side `fetch`. In browser-only event handlers, same-origin relative API paths are appropriate. Validate remote responses and check HTTP statuses before using their contents.

For mutations, validate with `.validator(z.object(...))`, await the write, and invalidate affected route data after success. Choose the appropriate Netlify data/auth skill for the feature instead of inventing storage or authentication.

Add TanStack Query when client-side caching, background refresh, or mutation coordination is needed. Create its QueryClient inside `getRouter()` so server requests don't share cached user data, wire its provider and router context together, and use the installed TanStack SSR integration for cache dehydration/hydration. Don't add a module-level shared server cache or a provider without the corresponding SSR setup.
