---
name: tanstack-start-server-functions
description: Create server functions in TanStack Start for server-side logic callable from anywhere. Use for database access, API calls with secrets, mutations, or any server-only code that needs to be called from components or loaders.
license: Apache-2.0
metadata:
  author: tanstack
  version: "1.0"
---

# TanStack Start Server Functions

Server functions are the primary way to run server-side code in TanStack Start. They provide type-safe RPC calls from client to server.

## When to Use

- Database queries and mutations
- API calls requiring secrets
- Server-only business logic
- Any code that needs server capabilities
- Called from loaders, components, or other server functions

## Basic Server Function

```typescript
// src/server/posts.functions.ts
import { createServerFn } from '@tanstack/react-start';

// Simple GET function
export const getPosts = createServerFn().handler(async () => {
  const posts = await db.query('SELECT * FROM posts');
  return posts;
});

// Call it anywhere
const posts = await getPosts();
```

## Function with Input

```typescript
// src/server/posts.functions.ts
import { createServerFn } from '@tanstack/react-start';

export const getPost = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const post = await db.query('SELECT * FROM posts WHERE id = $1', [data.id]);
    return post[0] || null;
  });

// Call with input
const post = await getPost({ data: { id: '123' } });
```

## HTTP Methods

```typescript
// GET - for reading data (default)
export const getData = createServerFn().handler(async () => {
  return { data: 'value' };
});

// GET with explicit method
export const getUser = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    return await findUser(data.id);
  });

// POST - for mutations
export const createPost = createServerFn({ method: 'POST' })
  .inputValidator((data: { title: string; content: string }) => data)
  .handler(async ({ data }) => {
    const post = await db.insert('posts', data);
    return post;
  });
```

## Input Validation with Zod

```typescript
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  age: z.number().int().min(0).optional(),
});

export const createUser = createServerFn({ method: 'POST' })
  .inputValidator(CreateUserSchema)
  .handler(async ({ data }) => {
    // data is fully typed and validated
    // { email: string, name: string, age?: number }
    
    const user = await db.insert('users', data);
    return user;
  });

// Usage - type errors if invalid
await createUser({
  data: {
    email: 'alice@example.com',
    name: 'Alice',
  },
});
```

## Organized File Structure

```
src/
├── server/
│   ├── posts.functions.ts     # Server function wrappers
│   ├── posts.server.ts        # Server-only helpers (DB queries)
│   ├── users.functions.ts
│   ├── users.server.ts
│   └── schemas.ts             # Shared validation schemas
├── routes/
│   └── posts.tsx
└── ...
```

### Server-Only Helpers

```typescript
// src/server/posts.server.ts
// These are server-only - NEVER import in client code

export async function findPostById(id: string) {
  return db.query('SELECT * FROM posts WHERE id = $1', [id]);
}

export async function insertPost(data: { title: string; content: string }) {
  return db.query(
    'INSERT INTO posts (title, content) VALUES ($1, $2) RETURNING *',
    [data.title, data.content]
  );
}
```

### Server Function Wrappers

```typescript
// src/server/posts.functions.ts
// These are the public API - safe to import anywhere

import { createServerFn } from '@tanstack/react-start';
import { findPostById, insertPost } from './posts.server';
import { z } from 'zod';

export const getPost = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    return findPostById(data.id);
  });

export const createPost = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    title: z.string().min(1),
    content: z.string(),
  }))
  .handler(async ({ data }) => {
    return insertPost(data);
  });
```

## Using in Components

```tsx
// src/routes/posts.tsx
import { createFileRoute } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getPosts, createPost } from '../server/posts.functions';
import { useServerFn } from '@tanstack/react-start';

export const Route = createFileRoute('/posts')({
  loader: async () => {
    // Call server function in loader
    const posts = await getPosts();
    return { posts };
  },
  component: PostsComponent,
});

function PostsComponent() {
  const { posts } = Route.useLoaderData();
  const queryClient = useQueryClient();
  
  // Wrap for use with TanStack Query
  const createPostFn = useServerFn(createPost);
  
  const mutation = useMutation({
    mutationFn: (data: { title: string; content: string }) =>
      createPostFn({ data }),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    mutation.mutate({
      title: formData.get('title') as string,
      content: formData.get('content') as string,
    });
  };
  
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input name="title" placeholder="Title" required />
        <textarea name="content" placeholder="Content" />
        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Creating...' : 'Create Post'}
        </button>
      </form>
      
      <ul>
        {posts.map((post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Form Data Handling

```typescript
import { createServerFn } from '@tanstack/react-start';

export const uploadFile = createServerFn({ method: 'POST' })
  .inputValidator((formData: FormData) => formData)
  .handler(async ({ data: formData }) => {
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    
    // Process file...
    const buffer = await file.arrayBuffer();
    
    return { filename: file.name, size: file.size };
  });

// Usage in component
function UploadForm() {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const result = await uploadFile({ data: formData });
    console.log('Uploaded:', result.filename);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input type="file" name="file" />
      <input type="text" name="name" />
      <button type="submit">Upload</button>
    </form>
  );
}
```

## Middleware

```typescript
import { createServerFn, createMiddleware } from '@tanstack/react-start';

// Create reusable middleware
const authMiddleware = createMiddleware().handler(async ({ next }) => {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  // Pass data to next middleware/handler
  return next({ user });
});

const loggingMiddleware = createMiddleware().handler(async ({ next }) => {
  const start = Date.now();
  const result = await next();
  console.log(`Request took ${Date.now() - start}ms`);
  return result;
});

// Use middleware in server function
export const getSecretData = createServerFn({ method: 'GET' })
  .middleware([loggingMiddleware, authMiddleware])
  .handler(async ({ context }) => {
    // context.user is available from authMiddleware
    return { secret: 'data', user: context.user };
  });
```

## Error Handling

```typescript
import { createServerFn } from '@tanstack/react-start';

export const riskyOperation = createServerFn({ method: 'POST' })
  .inputValidator((data: { value: number }) => data)
  .handler(async ({ data }) => {
    if (data.value < 0) {
      throw new Error('Value must be positive');
    }
    
    try {
      const result = await dangerousOperation(data.value);
      return { success: true, result };
    } catch (error) {
      // Log server-side
      console.error('Operation failed:', error);
      
      // Return safe error to client
      throw new Error('Operation failed. Please try again.');
    }
  });

// In component - handle errors
function MyComponent() {
  const [error, setError] = useState<string | null>(null);
  
  const handleClick = async () => {
    try {
      await riskyOperation({ data: { value: -1 } });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    }
  };
  
  return (
    <div>
      <button onClick={handleClick}>Do Thing</button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

## Redirects from Server Functions

```typescript
import { createServerFn } from '@tanstack/react-start';
import { redirect } from '@tanstack/react-router';

export const loginUser = createServerFn({ method: 'POST' })
  .inputValidator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    const user = await authenticate(data.email, data.password);
    
    if (!user) {
      return { error: 'Invalid credentials' };
    }
    
    // Set session cookie, etc.
    await createSession(user.id);
    
    // Redirect after successful login
    throw redirect({ to: '/dashboard' });
  });
```

## Environment Variables

```typescript
import { createServerFn } from '@tanstack/react-start';

export const callExternalApi = createServerFn({ method: 'GET' })
  .handler(async () => {
    // Access secrets safely on server
    const apiKey = process.env.EXTERNAL_API_KEY;
    
    const response = await fetch('https://api.example.com/data', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    
    return response.json();
  });
```

## Common Patterns

### CRUD Operations

```typescript
// src/server/items.functions.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { db, items } from '../db';
import { eq } from 'drizzle-orm';

const ItemSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
});

export const getItems = createServerFn().handler(async () => {
  return db.select().from(items);
});

export const getItem = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const result = await db.select().from(items).where(eq(items.id, data.id));
    return result[0] || null;
  });

export const createItem = createServerFn({ method: 'POST' })
  .inputValidator(ItemSchema)
  .handler(async ({ data }) => {
    const result = await db.insert(items).values(data).returning();
    return result[0];
  });

export const updateItem = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string() }).extend(ItemSchema.shape))
  .handler(async ({ data }) => {
    const { id, ...values } = data;
    const result = await db.update(items).set(values).where(eq(items.id, id)).returning();
    return result[0];
  });

export const deleteItem = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    await db.delete(items).where(eq(items.id, data.id));
    return { success: true };
  });
```

## Key Points

1. **Server functions run ONLY on the server** - Safe for secrets and DB access
2. **Type-safe across the network** - Input and output are fully typed
3. **Use `.functions.ts` suffix** - Clear convention for importable functions
4. **Validate input** - Use Zod or custom validators
5. **Keep `.server.ts` files private** - Never import directly in client code
6. **Use `useServerFn` hook** - When integrating with TanStack Query
