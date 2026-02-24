---
name: netlify-blobs
description: Store and retrieve unstructured data using Netlify Blobs key-value storage. Use for file uploads, caching, user-generated content, session storage, or any binary/JSON data persistence on Netlify.
license: Apache-2.0
metadata:
  author: netlify
  version: "1.0"
---

# Netlify Blobs

Netlify Blobs is a built-in key-value store for unstructured data. It's ideal for storing files, JSON, or any binary data without setting up external storage.

## When to Use

- Storing user uploads (images, files)
- Caching API responses
- Session or state storage
- Persisting background function results
- Deploy-specific data storage

## Installation

```bash
npm install @netlify/blobs
```

## Basic Usage

### Writing Data

```typescript
import { getStore } from "@netlify/blobs";

// Get a store reference
const store = getStore("my-store");

// Store a string
await store.set("greeting", "Hello, World!");

// Store JSON (automatically serialized)
await store.setJSON("user", { 
  id: 1, 
  name: "Alice",
  email: "alice@example.com" 
});

// Store binary data (Buffer, ArrayBuffer, Blob, ReadableStream)
await store.set("image", imageBuffer);
```

### Reading Data

```typescript
import { getStore } from "@netlify/blobs";

const store = getStore("my-store");

// Get as string
const greeting = await store.get("greeting");
// → "Hello, World!"

// Get as JSON (automatically parsed)
const user = await store.get("user", { type: "json" });
// → { id: 1, name: "Alice", email: "alice@example.com" }

// Get as ArrayBuffer
const imageData = await store.get("image", { type: "arrayBuffer" });

// Get as Blob
const blob = await store.get("image", { type: "blob" });

// Get as Stream
const stream = await store.get("image", { type: "stream" });

// Returns null if key doesn't exist
const missing = await store.get("nonexistent");
// → null
```

### Deleting Data

```typescript
const store = getStore("my-store");

// Delete a single key
await store.delete("old-data");

// Check if key exists before deleting
const exists = await store.get("maybe-exists");
if (exists) {
  await store.delete("maybe-exists");
}
```

### Listing Keys

```typescript
const store = getStore("my-store");

// List all keys
const { blobs } = await store.list();
for (const blob of blobs) {
  console.log(blob.key);
}

// List with prefix filter
const { blobs: userBlobs } = await store.list({ prefix: "users/" });

// Paginate through results
let cursor: string | undefined;
do {
  const result = await store.list({ cursor });
  for (const blob of result.blobs) {
    console.log(blob.key);
  }
  cursor = result.cursor;
} while (cursor);
```

## Storing Files with Metadata

```typescript
const store = getStore("uploads");

// Store file with metadata
await store.set("profile-123.jpg", imageBuffer, {
  metadata: {
    contentType: "image/jpeg",
    uploadedBy: "user-123",
    originalName: "my-photo.jpg",
  },
});

// Retrieve with metadata
const { data, metadata } = await store.getWithMetadata("profile-123.jpg", {
  type: "arrayBuffer",
});

console.log(metadata.contentType); // "image/jpeg"
```

## Consistency Modes

### Eventual Consistency (Default)

Data is cached at the edge for fast reads. Updates propagate within 60 seconds.

```typescript
const store = getStore("my-store");
// Uses eventual consistency by default
```

### Strong Consistency

For when you need immediate read-after-write consistency:

```typescript
// Store-level strong consistency
const store = getStore({
  name: "my-store",
  consistency: "strong",
});

// Or per-operation
const store = getStore("my-store");
const data = await store.get("key", { consistency: "strong" });
```

Use strong consistency when:
- Reading immediately after writing
- Handling transactions or counters
- Data correctness is critical

## Deploy-Scoped Stores

Data tied to a specific deploy (cleaned up with deploy):

```typescript
import { getDeployStore } from "@netlify/blobs";

// This store is scoped to the current deploy
const store = getDeployStore("build-cache");

// Data is automatically cleaned up when deploy is deleted
await store.set("compiled-assets", compiledData);
```

## Using in Functions

### Serverless Function Example

```typescript
// netlify/functions/upload.ts
import { getStore } from "@netlify/blobs";
import type { Context } from "@netlify/functions";

export default async (request: Request, context: Context) => {
  const store = getStore("uploads");
  
  if (request.method === "POST") {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return new Response("No file provided", { status: 400 });
    }
    
    const key = `${Date.now()}-${file.name}`;
    const buffer = await file.arrayBuffer();
    
    await store.set(key, buffer, {
      metadata: {
        contentType: file.type,
        originalName: file.name,
        size: file.size.toString(),
      },
    });
    
    return Response.json({ key, message: "Upload successful" });
  }
  
  if (request.method === "GET") {
    const url = new URL(request.url);
    const key = url.searchParams.get("key");
    
    if (!key) {
      return new Response("Key required", { status: 400 });
    }
    
    const { data, metadata } = await store.getWithMetadata(key, {
      type: "arrayBuffer",
    });
    
    if (!data) {
      return new Response("Not found", { status: 404 });
    }
    
    return new Response(data, {
      headers: {
        "Content-Type": metadata?.contentType || "application/octet-stream",
      },
    });
  }
  
  return new Response("Method not allowed", { status: 405 });
};
```

### Edge Function Example

```typescript
// netlify/edge-functions/cache.ts
import { getStore } from "@netlify/blobs";

export default async (request: Request) => {
  const url = new URL(request.url);
  const cacheKey = `page-cache:${url.pathname}`;
  
  const store = getStore("page-cache");
  
  // Try to get from cache
  const cached = await store.get(cacheKey, { type: "json" });
  
  if (cached && cached.expires > Date.now()) {
    return new Response(cached.html, {
      headers: { 
        "Content-Type": "text/html",
        "X-Cache": "HIT",
      },
    });
  }
  
  // Generate fresh content
  const html = await generatePage(url.pathname);
  
  // Cache for 5 minutes
  await store.setJSON(cacheKey, {
    html,
    expires: Date.now() + 5 * 60 * 1000,
  });
  
  return new Response(html, {
    headers: { 
      "Content-Type": "text/html",
      "X-Cache": "MISS",
    },
  });
};
```

## File-Based Uploads (Build Time)

Place files in `.netlify/blobs/deploy` during build:

```
project/
├── .netlify/
│   └── blobs/
│       └── deploy/
│           ├── assets/
│           │   └── logo.png
│           ├── $assets/logo.png.json  # Metadata file
│           └── config.json
```

Metadata file example (`$assets/logo.png.json`):
```json
{
  "contentType": "image/png",
  "uploadedAt": "2024-01-15T10:00:00Z"
}
```

## Common Patterns

### Rate Limiting

```typescript
const store = getStore({ name: "rate-limits", consistency: "strong" });

async function checkRateLimit(ip: string, limit: number, windowMs: number) {
  const key = `rate:${ip}`;
  const now = Date.now();
  
  const data = await store.get(key, { type: "json" }) as {
    count: number;
    resetAt: number;
  } | null;
  
  if (!data || data.resetAt < now) {
    await store.setJSON(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }
  
  if (data.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: data.resetAt };
  }
  
  await store.setJSON(key, { count: data.count + 1, resetAt: data.resetAt });
  return { allowed: true, remaining: limit - data.count - 1 };
}
```

### Session Storage

```typescript
const sessions = getStore({ name: "sessions", consistency: "strong" });

async function createSession(userId: string) {
  const sessionId = crypto.randomUUID();
  await sessions.setJSON(`session:${sessionId}`, {
    userId,
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  });
  return sessionId;
}

async function getSession(sessionId: string) {
  const session = await sessions.get(`session:${sessionId}`, { type: "json" });
  if (!session || session.expiresAt < Date.now()) {
    return null;
  }
  return session;
}
```

### Background Job Results

```typescript
// Background function writes result
// netlify/functions/process-background.ts
import { getStore } from "@netlify/blobs";

export default async (request: Request) => {
  const { jobId, data } = await request.json();
  const store = getStore("job-results");
  
  await store.setJSON(`job:${jobId}:status`, { status: "processing" });
  
  // Do long-running work...
  const result = await processData(data);
  
  await store.setJSON(`job:${jobId}:status`, { 
    status: "complete",
    result,
  });
};

// Regular function checks status
// netlify/functions/job-status.ts
export default async (request: Request) => {
  const url = new URL(request.url);
  const jobId = url.searchParams.get("id");
  
  const store = getStore("job-results");
  const status = await store.get(`job:${jobId}:status`, { type: "json" });
  
  return Response.json(status || { status: "not-found" });
};
```

## Limits

- **Key length**: 600 bytes max
- **Value size**: 5GB max per blob
- **Metadata**: 64KB max per blob
- **Store names**: Must be alphanumeric with hyphens
- **Consistency**: Eventual by default (60s propagation), strong available
