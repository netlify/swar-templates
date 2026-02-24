---
name: tanstack-start-api-routes
description: Create API routes (server routes) in TanStack Start for handling HTTP requests. Use when building REST APIs, webhooks, or any HTTP endpoint that returns data rather than rendering a page.
license: Apache-2.0
metadata:
  author: tanstack
  version: "1.0"
---

# TanStack Start API Routes (Server Routes)

TanStack Start allows you to create API endpoints using the `server` property on routes. These run server-side and handle raw HTTP requests.

## When to Use

- Building REST API endpoints
- Handling webhooks
- File uploads/downloads
- Any endpoint that returns data (not HTML)

**Note**: For RPC-style server logic callable from components, use **server functions** instead. Server routes are for traditional HTTP endpoints.

## Basic Server Route

```typescript
// src/routes/api/hello.ts
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/hello')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return new Response(JSON.stringify({ message: 'Hello, World!' }), {
          headers: { 'Content-Type': 'application/json' },
        });
      },
    },
  },
});
```

## Multiple HTTP Methods

```typescript
// src/routes/api/users.ts
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/users')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const users = await fetchUsers();
        return Response.json(users);
      },
      
      POST: async ({ request }) => {
        const body = await request.json();
        const newUser = await createUser(body);
        return Response.json(newUser, { status: 201 });
      },
    },
  },
});
```

## Dynamic Parameters

```typescript
// src/routes/api/users/$id.ts
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/users/$id')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { id } = params;
        const user = await getUser(id);
        
        if (!user) {
          return new Response('User not found', { status: 404 });
        }
        
        return Response.json(user);
      },
      
      PUT: async ({ request, params }) => {
        const { id } = params;
        const body = await request.json();
        const updatedUser = await updateUser(id, body);
        return Response.json(updatedUser);
      },
      
      DELETE: async ({ params }) => {
        const { id } = params;
        await deleteUser(id);
        return new Response(null, { status: 204 });
      },
    },
  },
});
```

## Multiple Dynamic Parameters

```typescript
// src/routes/api/users/$userId/posts/$postId.ts
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/users/$userId/posts/$postId')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { userId, postId } = params;
        const post = await getUserPost(userId, postId);
        return Response.json(post);
      },
    },
  },
});
```

## Handler Context

The handler receives a context object with:

```typescript
export const Route = createFileRoute('/api/example')({
  server: {
    handlers: {
      GET: async (context) => {
        // Request object (Web API Request)
        const { request } = context;
        
        // URL parameters from route
        const { params } = context;
        
        // Get headers
        const authHeader = request.headers.get('Authorization');
        
        // Get query parameters
        const url = new URL(request.url);
        const searchParams = url.searchParams;
        const page = searchParams.get('page');
        
        return Response.json({ page });
      },
    },
  },
});
```

## Request Body Handling

### JSON Body

```typescript
POST: async ({ request }) => {
  const body = await request.json();
  // body is parsed JSON
  return Response.json({ received: body });
},
```

### Form Data

```typescript
POST: async ({ request }) => {
  const formData = await request.formData();
  const name = formData.get('name');
  const email = formData.get('email');
  
  return Response.json({ name, email });
},
```

### Raw Text/Binary

```typescript
POST: async ({ request }) => {
  const text = await request.text();
  // or
  const buffer = await request.arrayBuffer();
  
  return new Response('Received', { status: 200 });
},
```

## Response Helpers

```typescript
// JSON response
return Response.json({ data: 'value' });

// JSON with status
return Response.json({ error: 'Not found' }, { status: 404 });

// Plain text
return new Response('Hello', {
  headers: { 'Content-Type': 'text/plain' },
});

// HTML
return new Response('<h1>Hello</h1>', {
  headers: { 'Content-Type': 'text/html' },
});

// Redirect
return Response.redirect('https://example.com', 302);

// No content
return new Response(null, { status: 204 });

// Stream
const stream = new ReadableStream({ ... });
return new Response(stream, {
  headers: { 'Content-Type': 'application/octet-stream' },
});
```

## Error Handling

```typescript
export const Route = createFileRoute('/api/users/$id')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const user = await getUser(params.id);
          
          if (!user) {
            return Response.json(
              { error: 'User not found' },
              { status: 404 }
            );
          }
          
          return Response.json(user);
        } catch (error) {
          console.error('Error fetching user:', error);
          
          return Response.json(
            { error: 'Internal server error' },
            { status: 500 }
          );
        }
      },
    },
  },
});
```

## Authentication

```typescript
// src/routes/api/protected.ts
import { createFileRoute } from '@tanstack/react-router';
import { verifyToken } from '../lib/auth';

export const Route = createFileRoute('/api/protected')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const authHeader = request.headers.get('Authorization');
        
        if (!authHeader?.startsWith('Bearer ')) {
          return Response.json(
            { error: 'Missing authorization header' },
            { status: 401 }
          );
        }
        
        const token = authHeader.slice(7);
        const user = await verifyToken(token);
        
        if (!user) {
          return Response.json(
            { error: 'Invalid token' },
            { status: 401 }
          );
        }
        
        // Proceed with authenticated request
        return Response.json({ user, message: 'Protected data' });
      },
    },
  },
});
```

## CORS Headers

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const Route = createFileRoute('/api/data')({
  server: {
    handlers: {
      // Handle preflight
      OPTIONS: async () => {
        return new Response(null, {
          status: 204,
          headers: corsHeaders,
        });
      },
      
      GET: async ({ request }) => {
        const data = await fetchData();
        
        return Response.json(data, {
          headers: corsHeaders,
        });
      },
    },
  },
});
```

## File Naming Conventions

| File Path | API Route |
|-----------|-----------|
| `routes/api/hello.ts` | `GET /api/hello` |
| `routes/api/users.ts` | `GET /api/users` |
| `routes/api/users/$id.ts` | `GET /api/users/:id` |
| `routes/api/users.index.ts` | `GET /api/users` |
| `routes/api/file/$.ts` | `GET /api/file/*` (catch-all) |

## Combined Route + API

A single file can handle both page rendering and API:

```typescript
// src/routes/posts.$postId.tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/posts/$postId')({
  // Server route handlers (API)
  server: {
    handlers: {
      // GET /posts/123 with Accept: application/json → JSON response
      GET: async ({ request, params }) => {
        const accept = request.headers.get('Accept');
        
        if (accept?.includes('application/json')) {
          const post = await getPost(params.postId);
          return Response.json(post);
        }
        
        // Fall through to page rendering
        return undefined;
      },
    },
  },
  
  // Page loader and component
  loader: async ({ params }) => {
    const post = await getPost(params.postId);
    return { post };
  },
  
  component: PostComponent,
});
```

## Webhooks Example

```typescript
// src/routes/api/webhooks/stripe.ts
import { createFileRoute } from '@tanstack/react-router';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const Route = createFileRoute('/api/webhooks/stripe')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const sig = request.headers.get('stripe-signature');
        const body = await request.text();
        
        let event: Stripe.Event;
        
        try {
          event = stripe.webhooks.constructEvent(
            body,
            sig!,
            process.env.STRIPE_WEBHOOK_SECRET!
          );
        } catch (err) {
          return Response.json(
            { error: 'Invalid signature' },
            { status: 400 }
          );
        }
        
        switch (event.type) {
          case 'checkout.session.completed':
            await handleCheckoutComplete(event.data.object);
            break;
          // Handle other events...
        }
        
        return Response.json({ received: true });
      },
    },
  },
});
```

## Best Practices

1. **Use server functions for RPC** - If calling from components, prefer `createServerFn`
2. **Validate input** - Always validate request bodies and parameters
3. **Handle errors** - Return appropriate status codes and messages
4. **Set correct headers** - Content-Type, CORS, caching as needed
5. **Keep handlers focused** - One responsibility per endpoint
6. **Use TypeScript** - Type your request/response bodies
