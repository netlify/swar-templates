# Routing

TanStack Start uses file-based routing in `src/routes`. Keep the app shell in `__root.tsx`; its `children` render the matched routes. Don't replace it with a Next.js `app/layout.tsx` or create a second `src/pages` router.

| File                      | URL                                                |
| ------------------------- | -------------------------------------------------- |
| `index.tsx`               | `/`                                                |
| `about.tsx`               | `/about`                                           |
| `products/$productId.tsx` | `/products/:productId`                             |
| `_layout.tsx`             | Pathless layout; render its children with `Outlet` |
| `api.items.ts`            | `/api/items`, using server handlers                |

Route files use `createFileRoute`. `src/routeTree.gen.ts` is generated; don't edit it. Router types are registered in `src/router.tsx`.

Link to dynamic routes with `to="/products/$productId"` and `params={{ productId }}`. Avoid interpolating paths into strings that bypass route checks.

The root route supplies a 404 page. The router's default error component supplies retry/home actions, including for child-route SSR failures. In a loader, `throw notFound()` from `@tanstack/react-router` for missing records. Throw unexpected failures normally so the error page handles them. Add route-specific `head()` metadata for individual articles or products; otherwise the root metadata is inherited.
