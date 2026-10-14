---
name: tanstack-start-api-routes
description: Create API routes (server routes) in TanStack Start for handling HTTP requests. Use when building REST APIs, webhooks, or any HTTP endpoint that returns data rather than rendering a page.
license: Apache-2.0
metadata:
  author: tanstack
  version: "1.0"
---

# HTTP server routes

Use createFileRoute with server.handlers for raw HTTP endpoints. Use createServerFn when a page needs typed RPC instead. These are TanStack Start routes, not Next.js route handlers or a separate Express server.

## Complete JSON endpoints

```ts file=src/routes/api.hello.ts
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/hello')({
  server: { handlers: {
    GET: () => Response.json({ message: 'Hello' }),
  } },
})
```

```ts file=src/routes/api.echo.ts
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const input = z.object({ message: z.string().trim().min(1).max(500) })

export const Route = createFileRoute('/api/echo')({
  server: { handlers: {
    POST: async ({ request }) => {
      let body: unknown
      try { body = await request.json() } catch {
        return Response.json({ error: 'Invalid JSON' }, { status: 400 })
      }
      const parsed = input.safeParse(body)
      if (!parsed.success) return Response.json({ error: 'A message is required' }, { status: 400 })
      return Response.json({ message: parsed.data.message })
    },
  } },
})
```

The echo endpoint validates and returns input only; it does not save a record. Zod must be declared in the generated app before using the example. request, params, and route middleware context come from the handler argument. Read query parameters from new URL(request.url).searchParams.

## Response and integration rules

Use Response.json for JSON, new Response for text/bytes, Response.redirect with an absolute trusted destination, and new Response(null, { status: 204 }) for no content. Use status, not a v1 Lambda statusCode object. Return an explicit Response from a handler; do not assume returning undefined renders a page. For combined page/API handling, follow the installed handler's next() contract.

Validate JSON, query values, route parameters, and form fields at runtime. Use request.text() for signed webhook bodies before verifying the signature; JSON parsing first changes the signed bytes. Check required secrets/signatures before calling a provider library. Do not add fulfillment or webhook processing to a checkout-only example unless requested.

Enforce authorization inside every protected endpoint. A page guard is not an API permission check. Use the Netlify Identity integration rather than an undefined verifyToken helper or hand-written JWT parser. Do not add wildcard CORS to a same-origin app; cross-origin access needs an explicit trusted origin policy.

For external API requests, check response.ok and validate response data before using it. Do not return internal stack traces, upstream response bodies, keys, or tokens in error messages. File uploads need field, size, and type checks, plus the appropriate storage integration if persistence is requested.

| File | Endpoint |
| --- | --- |
| api.hello.ts | /api/hello |
| api/items.ts | /api/items |
| api.items.$itemId.ts | /api/items/:itemId |
| api.files.$.ts | /api/files/* |

Generate route types after adding server routes and check both status and body locally. A build proves compilation, not that a request was accepted or a side effect happened.
