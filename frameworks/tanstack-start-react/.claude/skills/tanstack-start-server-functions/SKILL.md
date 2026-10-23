---
name: tanstack-start-server-functions
description: Create validated TanStack Start server functions and composable middleware for server-only logic called from loaders or components.
license: Apache-2.0
metadata:
  author: tanstack
  version: "1.0"
---

# TanStack Start server functions

Use createServerFn for server-only work that a loader or component needs to call. Its handler runs on the server; a route loader itself is isomorphic. Keep credentials and private helpers inside the server handler and return only the client-safe data required by the page.

## Validate public input

Use .validator(...) with the packages pinned in this repository. Older installed start-client-core versions also expose an inputValidator alias, but Basic's newer version does not. The old instruction that validator does not exist is incorrect. Check the installed implementation when upgrading.

A TypeScript annotation or a callback returning its input is not runtime validation. Use a schema or validate unknown values explicitly. Install zod in a generated app if it is not already declared; it is optional framework functionality, not a dependency of every starter.

This complete example uses a small read-only sample catalog. It does not create a database or persist changes.

```ts file=src/lib/items.functions.ts
import { createMiddleware, createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

const itemInput = z.object({ id: z.string().trim().min(1).max(100) })

export const getItems = createServerFn({ method: 'GET' }).handler(async () => {
  return [{ id: 'example', name: 'Example item' }]
})

export const getItem = createServerFn({ method: 'GET' })
  .validator(itemInput)
  .handler(async ({ data }) => {
    const items = await getItems()
    return items.find((item) => item.id === data.id) ?? null
  })

const requestContext = createMiddleware({ type: 'function' }).server(async ({ next }) => {
  return next({ context: { requestId: crypto.randomUUID() } })
})

export const getRequestSummary = createServerFn({ method: 'GET' })
  .middleware([requestContext])
  .handler(async ({ context }) => ({ requestId: context.requestId }))
```

Call getItem({ data: { id: 'example' } }); data is the call envelope, not a positional argument. GET is for reads, POST for mutations. Await a successful write before invalidating affected route data. The sample above contains no write or fake success response.

## Middleware

Use createMiddleware({ type: 'function' }).server(...) for server-function middleware. createMiddleware().handler(...) is not supported. Pass new context with next({ context: { ... } }), not next({ user }) or another top-level property. Apply middleware with .middleware([...]). For authentication, use the Netlify Identity integration skill and verify authorization in every protected server function, not just in a page guard.

## External APIs and files

Read secret configuration inside the handler, reject missing configuration, use an absolute trusted URL for server fetch, check response.ok, and validate returned data. Set an appropriate timeout with AbortSignal.timeout. Do not expose provider error bodies or internal diagnostic messages to users.

FormData input can use a validator that checks instanceof FormData and validates each field/file. A cast to File does not prove a file was supplied. Check size/type before processing and use the applicable storage skill when storing uploads. A .server.ts filename expresses intent; use Start's server-only facilities when a hard client-import boundary is needed.

Server-function calls from components can use useServerFn when its redirect-aware wrapper is needed. TanStack Query is optional and requires its own provider/router SSR setup; do not use useQueryClient in an app that has no provider.
