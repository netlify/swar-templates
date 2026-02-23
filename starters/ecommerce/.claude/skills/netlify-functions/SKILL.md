---
name: netlify-functions
description: Create and deploy Netlify serverless functions and edge functions. Use when implementing API endpoints, server-side logic, background jobs, scheduled tasks, or edge computing on Netlify.
license: Apache-2.0
metadata:
  author: netlify
  version: "1.0"
---

# Netlify Functions

Netlify Functions are serverless functions that run on-demand without managing servers. They support JavaScript, TypeScript, and Go.

## When to Use

- API endpoints for your frontend
- Server-side data processing
- Third-party API integrations (hiding API keys)
- Background/async processing
- Scheduled jobs (cron-like)
- Edge computing (low-latency responses)

## Directory Structure

```
project/
├── netlify/
│   └── functions/
│       ├── hello.ts           # → /.netlify/functions/hello
│       ├── api/
│       │   └── users.ts       # → /.netlify/functions/api-users
│       └── process-background.ts  # Background function
│   └── edge-functions/
│       └── geo.ts             # Edge function
├── netlify.toml
└── package.json
```

## Basic Serverless Function (TypeScript)

```typescript
// netlify/functions/hello.ts
import type { Context } from "@netlify/functions";

export default async (request: Request, context: Context) => {
  const { name = "World" } = await request.json().catch(() => ({}));
  
  return new Response(JSON.stringify({ message: `Hello, ${name}!` }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
```

## Function with Path Parameters

```typescript
// netlify/functions/users.ts
import type { Context } from "@netlify/functions";

export default async (request: Request, context: Context) => {
  const { id } = context.params; // From path like /api/users/:id
  
  // Fetch user from database
  const user = await getUser(id);
  
  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  return Response.json(user);
};

// Configure custom path in the function
export const config = {
  path: "/api/users/:id",
};
```

## Handling Different HTTP Methods

```typescript
// netlify/functions/items.ts
import type { Context } from "@netlify/functions";

export default async (request: Request, context: Context) => {
  const { method } = request;
  
  switch (method) {
    case "GET":
      return handleGet(request, context);
    case "POST":
      return handlePost(request, context);
    case "PUT":
      return handlePut(request, context);
    case "DELETE":
      return handleDelete(request, context);
    default:
      return new Response("Method not allowed", { status: 405 });
  }
};

async function handleGet(request: Request, context: Context) {
  const items = await fetchItems();
  return Response.json(items);
}

async function handlePost(request: Request, context: Context) {
  const body = await request.json();
  const newItem = await createItem(body);
  return Response.json(newItem, { status: 201 });
}
```

## Environment Variables

Access environment variables via `process.env`:

```typescript
// netlify/functions/api.ts
export default async (request: Request, context: Context) => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    return new Response("API key not configured", { status: 500 });
  }
  
  const response = await fetch("https://api.example.com/data", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  
  return Response.json(await response.json());
};
```

Set environment variables in Netlify UI or `netlify.toml`:

```toml
# netlify.toml
[build.environment]
  API_KEY = "your-api-key"  # Better to set in Netlify UI for secrets
```

## Background Functions

For long-running tasks (up to 15 minutes), use background functions:

```typescript
// netlify/functions/process-background.ts
// Name MUST end with `-background`
import type { Context } from "@netlify/functions";

export default async (request: Request, context: Context) => {
  const data = await request.json();
  
  // Long-running task - client gets 202 immediately
  await processLargeDataset(data);
  
  // Response is ignored for background functions
  // Client always receives 202 Accepted immediately
};
```

**Naming**: File must be named `*-background.ts` (e.g., `process-background.ts`)

## Scheduled Functions

Run functions on a schedule (cron):

```typescript
// netlify/functions/daily-cleanup.ts
import type { Config } from "@netlify/functions";

export default async () => {
  await cleanupOldRecords();
  console.log("Cleanup completed");
};

export const config: Config = {
  schedule: "0 0 * * *", // Run daily at midnight UTC
};
```

Common cron patterns:
- `"0 * * * *"` - Every hour
- `"0 0 * * *"` - Daily at midnight
- `"0 0 * * 0"` - Weekly on Sunday
- `"*/5 * * * *"` - Every 5 minutes

## Edge Functions

Edge functions run closer to users for ultra-low latency:

```typescript
// netlify/edge-functions/geo.ts
import type { Context } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
  const { country, city } = context.geo;
  
  return new Response(JSON.stringify({
    message: `Hello from ${city}, ${country}!`,
    timestamp: new Date().toISOString(),
  }), {
    headers: { "Content-Type": "application/json" },
  });
};

export const config = {
  path: "/api/location",
};
```

Configure in `netlify.toml`:

```toml
[[edge_functions]]
  function = "geo"
  path = "/api/location"
```

## Edge Function vs Serverless Function

| Feature | Serverless | Edge |
|---------|-----------|------|
| Location | Single region | Global edge |
| Timeout | 10s (26s on paid) | 50ms |
| Cold start | Can be slow | Very fast |
| Use case | Heavy computation | Low-latency responses |
| Middleware | No | Yes |

## Context Object Properties

```typescript
export default async (request: Request, context: Context) => {
  // Request info
  context.ip;                    // Client IP address
  context.geo.city;              // Geo location
  context.geo.country.code;      // Country code
  context.geo.subdivision.code;  // State/region
  
  // Deploy info
  context.site.id;               // Site ID
  context.deploy.id;             // Deploy ID
  context.deploy.published;      // Is this the published deploy?
  
  // Function info
  context.requestId;             // Unique request ID
  context.params;                // URL path parameters
  
  // Cookies
  context.cookies.get("session");
  context.cookies.set({ name: "session", value: "abc123" });
  
  // Environment
  context.env.get("API_KEY");
};
```

## CORS Configuration

```typescript
// netlify/functions/api.ts
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

export default async (request: Request, context: Context) => {
  // Handle preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }
  
  // Your logic here
  const data = { message: "Hello" };
  
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { ...headers, "Content-Type": "application/json" },
  });
};
```

## netlify.toml Configuration

```toml
[build]
  functions = "netlify/functions"

[functions]
  # Set default Node.js version
  node_bundler = "esbuild"
  
  # Include files in function bundle
  included_files = ["data/**"]

# Function-specific settings
[functions."api-*"]
  # Increase memory for API functions
  memory = 1024

# Edge function declarations
[[edge_functions]]
  function = "auth"
  path = "/dashboard/*"
```

## Local Development

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Run locally with functions
netlify dev

# Functions available at http://localhost:8888/.netlify/functions/
```

## Common Patterns

### Database Connection

```typescript
// netlify/functions/db.ts
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export default async (request: Request) => {
  const users = await sql`SELECT * FROM users LIMIT 10`;
  return Response.json(users);
};
```

### Rate Limiting with Blobs

```typescript
import { getStore } from "@netlify/blobs";

export default async (request: Request, context: Context) => {
  const store = getStore("rate-limits");
  const ip = context.ip;
  
  const current = await store.get(ip, { type: "json" }) as { count: number; reset: number } | null;
  const now = Date.now();
  
  if (current && current.reset > now && current.count >= 100) {
    return new Response("Rate limit exceeded", { status: 429 });
  }
  
  await store.setJSON(ip, {
    count: (current?.count || 0) + 1,
    reset: current?.reset > now ? current.reset : now + 60000,
  });
  
  // Continue with request...
};
```

## Limits

- **Serverless functions**: 10 second timeout (26s on paid plans)
- **Background functions**: 15 minute timeout
- **Edge functions**: 50ms CPU time
- **Payload size**: 6MB request/response
- **Memory**: 1024MB default (configurable)
