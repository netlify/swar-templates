---
name: tanstack-start-loaders
description: Load data for TanStack Start routes using beforeLoad and loader functions. Use when fetching data for pages, implementing route guards, or setting up route context. IMPORTANT - Loaders should call server functions for data access.
license: Apache-2.0
metadata:
  author: tanstack
  version: "1.0"
---

# TanStack Start Loaders

TanStack Start provides `beforeLoad` and `loader` functions for route data loading. Both are **isomorphic** - they run on the server during SSR and on the client during navigation.

## Critical Rule

**Loaders should call server functions when accessing databases, APIs with secrets, or any server-only resources.** Loaders are isomorphic (run on both server and client), so they cannot directly access server-only code.

```tsx
// ❌ WRONG - Direct database access in loader
export const Route = createFileRoute('/posts')({
  loader: async () => {
    // This will FAIL on client-side navigation!
    const posts = await db.query('SELECT * FROM posts');
    return { posts };
  },
});

// ✅ CORRECT - Call server function from loader
import { getPosts } from '../server/posts.functions';

export const Route = createFileRoute('/posts')({
  loader: async () => {
    const posts = await getPosts();
    return { posts };
  },
});
```

## When to Use

- **beforeLoad**: Route guards, authentication, setting context
- **loader**: Fetching data for the route component

## beforeLoad vs loader

| Feature | beforeLoad | loader |
|---------|------------|--------|
| Execution | Sequential (parent → child) | Parallel across routes |
| Return | Merges into context | Route-specific data |
| Use case | Guards, auth, context setup | Data fetching |

## beforeLoad Function

Runs sequentially from parent to child. Use for guards and context:

```tsx
// src/routes/_protected.tsx
import { createFileRoute, redirect } from '@tanstack/react-router';
import { getUser } from '../server/auth.functions';

export const Route = createFileRoute('/_protected')({
  beforeLoad: async ({ context }) => {
    // Call server function - NOT direct database access
    const user = await getUser();
    
    if (!user) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      });
    }
    
    // Return value merges into context for child routes
    return { user };
  },
  component: ProtectedLayout,
});
```

Child routes can access parent's beforeLoad data:

```tsx
// src/routes/_protected.dashboard.tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_protected/dashboard')({
  beforeLoad: ({ context }) => {
    // Access user from parent's beforeLoad
    console.log('User:', context.user);
  },
  component: DashboardComponent,
});
```

## loader Function

Fetches route-specific data. Runs in parallel across matched routes:

```tsx
// src/routes/posts.tsx
import { createFileRoute } from '@tanstack/react-router';
import { getPosts } from '../server/posts.functions';

export const Route = createFileRoute('/posts')({
  loader: async () => {
    // Call server function for data
    const posts = await getPosts();
    return { posts };
  },
  component: PostsComponent,
});

function PostsComponent() {
  // Type-safe access to loader data
  const { posts } = Route.useLoaderData();
  
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

## Loader with Parameters

```tsx
// src/routes/posts.$postId.tsx
import { createFileRoute } from '@tanstack/react-router';
import { getPost } from '../server/posts.functions';

export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params }) => {
    const post = await getPost({ data: { id: params.postId } });
    
    if (!post) {
      throw new Error('Post not found');
    }
    
    return { post };
  },
  component: PostComponent,
});

function PostComponent() {
  const { post } = Route.useLoaderData();
  
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
```

## Loader Dependencies (loaderDeps)

Re-run loader when search params change:

```tsx
// src/routes/posts.tsx
import { createFileRoute } from '@tanstack/react-router';
import { searchPosts } from '../server/posts.functions';

export const Route = createFileRoute('/posts')({
  validateSearch: (search) => ({
    page: Number(search.page) || 1,
    filter: search.filter as string | undefined,
  }),
  
  // Define which values trigger loader re-runs
  loaderDeps: ({ search }) => ({
    page: search.page,
    filter: search.filter,
  }),
  
  loader: async ({ deps }) => {
    // deps contains values from loaderDeps
    const { posts, total } = await searchPosts({ 
      data: { page: deps.page, filter: deps.filter }
    });
    return { posts, total, page: deps.page };
  },
  
  component: PostsComponent,
});

function PostsComponent() {
  const { posts, total, page } = Route.useLoaderData();
  const navigate = useNavigate();
  
  return (
    <div>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
      
      <button
        onClick={() => navigate({ search: { page: page + 1 } })}
      >
        Next Page
      </button>
    </div>
  );
}
```

## Deferred Data Loading

Load critical data first, stream non-critical data:

```tsx
// src/routes/posts.$postId.tsx
import { createFileRoute, Await } from '@tanstack/react-router';
import { getPost, getComments, getRelatedPosts } from '../server/posts.functions';

export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params }) => {
    // Critical data - await it
    const post = await getPost({ data: { id: params.postId } });
    
    // Non-critical data - don't await, stream later
    const commentsPromise = getComments({ data: { postId: params.postId } });
    const relatedPromise = getRelatedPosts({ data: { postId: params.postId } });
    
    return {
      post,
      comments: commentsPromise,  // Promise, not resolved
      related: relatedPromise,    // Promise, not resolved
    };
  },
  component: PostComponent,
});

function PostComponent() {
  const { post, comments, related } = Route.useLoaderData();
  
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      
      {/* Comments stream in when ready */}
      <Suspense fallback={<p>Loading comments...</p>}>
        <Await promise={comments}>
          {(resolvedComments) => (
            <section>
              <h2>Comments</h2>
              {resolvedComments.map((c) => (
                <div key={c.id}>{c.text}</div>
              ))}
            </section>
          )}
        </Await>
      </Suspense>
      
      {/* Related posts stream in when ready */}
      <Suspense fallback={<p>Loading related...</p>}>
        <Await promise={related}>
          {(resolvedRelated) => (
            <aside>
              <h2>Related Posts</h2>
              <ul>
                {resolvedRelated.map((p) => (
                  <li key={p.id}>{p.title}</li>
                ))}
              </ul>
            </aside>
          )}
        </Await>
      </Suspense>
    </article>
  );
}
```

## Context from Router

Pass initial context from router creation:

```tsx
// src/router.tsx
import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

export function getRouter() {
  return createRouter({
    routeTree,
    context: {
      // Initial context available to all routes
      queryClient: new QueryClient(),
    },
  });
}
```

Access in loaders:

```tsx
export const Route = createFileRoute('/posts')({
  loader: async ({ context }) => {
    // Access router context
    return context.queryClient.ensureQueryData(postsQueryOptions());
  },
});
```

## Error Handling

```tsx
export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params }) => {
    const post = await getPost({ data: { id: params.postId } });
    
    if (!post) {
      throw new Error('Post not found');
    }
    
    return { post };
  },
  
  // Custom error component
  errorComponent: ({ error }) => (
    <div>
      <h1>Error Loading Post</h1>
      <p>{error.message}</p>
      <Link to="/posts">Back to Posts</Link>
    </div>
  ),
  
  component: PostComponent,
});
```

## Pending/Loading States

```tsx
export const Route = createFileRoute('/posts')({
  loader: async () => {
    const posts = await getPosts();
    return { posts };
  },
  
  // Show while loading
  pendingComponent: () => <div>Loading posts...</div>,
  
  // Minimum time to show pending (prevents flash)
  pendingMinMs: 200,
  
  // Delay before showing pending
  pendingMs: 100,
  
  component: PostsComponent,
});
```

## Stale Time Configuration

Control when loaders re-run:

```tsx
export const Route = createFileRoute('/posts')({
  // Data is fresh for 5 minutes
  staleTime: 5 * 60 * 1000,
  
  // Preload data is fresh for 30 seconds
  preloadStaleTime: 30 * 1000,
  
  // Garbage collect after 10 minutes
  gcTime: 10 * 60 * 1000,
  
  loader: async () => {
    return { posts: await getPosts() };
  },
});
```

## Using with TanStack Query

For complex caching needs, use TanStack Query with loaders:

```tsx
import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery, queryOptions } from '@tanstack/react-query';
import { getPosts } from '../server/posts.functions';

const postsQueryOptions = () => queryOptions({
  queryKey: ['posts'],
  queryFn: () => getPosts(),
});

export const Route = createFileRoute('/posts')({
  loader: async ({ context }) => {
    // Ensure data is in cache before rendering
    await context.queryClient.ensureQueryData(postsQueryOptions());
  },
  component: PostsComponent,
});

function PostsComponent() {
  // Use query hook for reactive updates
  const { data: posts } = useSuspenseQuery(postsQueryOptions());
  
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

## Summary

1. **Always use server functions** in loaders for server-only operations
2. **beforeLoad** for guards and context (sequential)
3. **loader** for data fetching (parallel)
4. Use **loaderDeps** to re-run on search param changes
5. **Defer** non-critical data with promises
6. Configure **staleTime** for caching behavior
