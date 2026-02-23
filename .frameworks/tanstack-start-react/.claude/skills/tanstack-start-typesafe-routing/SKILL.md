---
name: tanstack-start-typesafe-routing
description: Implement type-safe navigation and links in TanStack Start. Use when creating links, navigating programmatically, working with search params, or accessing route parameters with full TypeScript support.
license: Apache-2.0
metadata:
  author: tanstack
  version: "1.0"
---

# TanStack Start Type-Safe Routing

TanStack Router provides full type-safety for navigation, parameters, and search params. TypeScript catches invalid routes at compile time.

## When to Use

- Creating links between pages
- Programmatic navigation
- Working with URL search parameters
- Accessing route parameters
- Building type-safe navigation components

## Type-Safe Links

```tsx
import { Link } from '@tanstack/react-router';

function Navigation() {
  return (
    <nav>
      {/* Basic link */}
      <Link to="/">Home</Link>
      
      {/* Link with params - TypeScript enforces required params */}
      <Link to="/posts/$postId" params={{ postId: '123' }}>
        View Post
      </Link>
      
      {/* Link with search params */}
      <Link to="/posts" search={{ page: 1, sort: 'newest' }}>
        Posts
      </Link>
      
      {/* Link with both */}
      <Link
        to="/users/$userId/posts"
        params={{ userId: 'abc' }}
        search={{ filter: 'published' }}
      >
        User Posts
      </Link>
    </nav>
  );
}
```

## TypeScript Catches Errors

```tsx
// ❌ TypeScript Error: Route '/post' doesn't exist
<Link to="/post">Post</Link>

// ❌ TypeScript Error: Missing required param 'postId'
<Link to="/posts/$postId">Post</Link>

// ❌ TypeScript Error: 'postid' should be 'postId'
<Link to="/posts/$postId" params={{ postid: '123' }}>Post</Link>

// ✅ Correct
<Link to="/posts/$postId" params={{ postId: '123' }}>Post</Link>
```

## Link Props

```tsx
<Link
  // Route path (type-checked)
  to="/posts/$postId"
  
  // Path parameters
  params={{ postId: '123' }}
  
  // Search/query parameters
  search={{ page: 1 }}
  
  // Hash fragment
  hash="comments"
  
  // Replace history instead of push
  replace
  
  // Preload on hover/focus
  preload="intent"
  
  // Active link styling
  activeProps={{ className: 'active' }}
  inactiveProps={{ className: 'inactive' }}
  
  // Custom active check
  activeOptions={{ exact: true }}
  
  // Disable the link
  disabled={isLoading}
>
  View Post
</Link>
```

## Programmatic Navigation

### useNavigate Hook

```tsx
import { useNavigate } from '@tanstack/react-router';

function MyComponent() {
  const navigate = useNavigate();
  
  const handleClick = () => {
    // Simple navigation
    navigate({ to: '/posts' });
    
    // With params
    navigate({
      to: '/posts/$postId',
      params: { postId: '123' },
    });
    
    // With search params
    navigate({
      to: '/posts',
      search: { page: 2, sort: 'date' },
    });
    
    // Replace instead of push
    navigate({
      to: '/login',
      replace: true,
    });
    
    // Relative navigation
    navigate({
      to: '..',  // Go up one level
    });
  };
  
  return <button onClick={handleClick}>Go</button>;
}
```

### From Route Context

```tsx
export const Route = createFileRoute('/posts/$postId')({
  component: PostComponent,
});

function PostComponent() {
  const navigate = Route.useNavigate();
  
  // navigate is pre-bound to current route context
  const goToEdit = () => {
    navigate({
      to: '/posts/$postId/edit',
      params: (prev) => prev, // Keep current params
    });
  };
}
```

## Search Parameters

### Defining Search Schema

```tsx
// src/routes/posts.tsx
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

const PostsSearchSchema = z.object({
  page: z.number().default(1),
  sort: z.enum(['newest', 'oldest', 'popular']).default('newest'),
  filter: z.string().optional(),
});

export const Route = createFileRoute('/posts')({
  validateSearch: PostsSearchSchema,
  component: PostsComponent,
});

function PostsComponent() {
  // search is fully typed: { page: number, sort: 'newest' | 'oldest' | 'popular', filter?: string }
  const search = Route.useSearch();
  
  return (
    <div>
      <p>Page: {search.page}</p>
      <p>Sort: {search.sort}</p>
      {search.filter && <p>Filter: {search.filter}</p>}
    </div>
  );
}
```

### Updating Search Params

```tsx
function PostsComponent() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  
  const setPage = (page: number) => {
    navigate({
      search: (prev) => ({ ...prev, page }),
    });
  };
  
  const setSort = (sort: 'newest' | 'oldest' | 'popular') => {
    navigate({
      search: (prev) => ({ ...prev, sort, page: 1 }), // Reset page on sort change
    });
  };
  
  const clearFilter = () => {
    navigate({
      search: (prev) => {
        const { filter, ...rest } = prev;
        return rest;
      },
    });
  };
  
  return (
    <div>
      <select value={search.sort} onChange={(e) => setSort(e.target.value as any)}>
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="popular">Popular</option>
      </select>
      
      <button onClick={() => setPage(search.page + 1)}>Next Page</button>
    </div>
  );
}
```

### useSearch Hook

```tsx
import { useSearch } from '@tanstack/react-router';

function SearchDisplay() {
  // Get search params from current route
  const search = useSearch({ from: '/posts' });
  
  // Or strict mode (throws if not on that route)
  const strictSearch = useSearch({ from: '/posts', strict: true });
  
  return <div>Page: {search.page}</div>;
}
```

## Route Parameters

### Accessing Params

```tsx
// src/routes/posts.$postId.tsx
export const Route = createFileRoute('/posts/$postId')({
  component: PostComponent,
});

function PostComponent() {
  // Fully typed: { postId: string }
  const params = Route.useParams();
  
  return <h1>Post {params.postId}</h1>;
}
```

### Multiple Params

```tsx
// src/routes/users.$userId.posts.$postId.tsx
export const Route = createFileRoute('/users/$userId/posts/$postId')({
  component: UserPostComponent,
});

function UserPostComponent() {
  // Fully typed: { userId: string, postId: string }
  const { userId, postId } = Route.useParams();
  
  return <h1>User {userId}'s Post {postId}</h1>;
}
```

### Typed Params with Parsing

```tsx
export const Route = createFileRoute('/posts/$postId')({
  parseParams: (params) => ({
    postId: parseInt(params.postId, 10),
  }),
  stringifyParams: (params) => ({
    postId: String(params.postId),
  }),
  component: PostComponent,
});

function PostComponent() {
  // Now typed as { postId: number }
  const { postId } = Route.useParams();
  
  console.log(postId + 1); // TypeScript knows it's a number
}
```

## Building Type-Safe Navigation Components

### Breadcrumbs

```tsx
import { Link, useMatches } from '@tanstack/react-router';

function Breadcrumbs() {
  const matches = useMatches();
  
  return (
    <nav aria-label="Breadcrumb">
      <ol>
        {matches.map((match, index) => {
          const isLast = index === matches.length - 1;
          
          return (
            <li key={match.id}>
              {isLast ? (
                <span>{match.routeId}</span>
              ) : (
                <Link to={match.pathname}>{match.routeId}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
```

### Active Link Styling

```tsx
<Link
  to="/posts"
  activeProps={{
    className: 'text-blue-600 font-bold',
  }}
  inactiveProps={{
    className: 'text-gray-600',
  }}
>
  Posts
</Link>

// With exact matching
<Link
  to="/posts"
  activeOptions={{ exact: true }}
  activeProps={{ className: 'active' }}
>
  Posts Index
</Link>

// Include search params in active check
<Link
  to="/posts"
  search={{ sort: 'newest' }}
  activeOptions={{ includeSearch: true }}
>
  Newest Posts
</Link>
```

## Router Hooks

```tsx
import {
  useRouter,
  useRouterState,
  useLocation,
  useParams,
  useSearch,
  useNavigate,
  useMatches,
} from '@tanstack/react-router';

function RouterInfo() {
  // Full router instance
  const router = useRouter();
  
  // Router state (location, matches, etc.)
  const state = useRouterState();
  
  // Current location
  const location = useLocation();
  console.log(location.pathname, location.search, location.hash);
  
  // Route params (requires 'from' for type safety)
  const params = useParams({ from: '/posts/$postId' });
  
  // Search params (requires 'from' for type safety)
  const search = useSearch({ from: '/posts' });
  
  // Navigation function
  const navigate = useNavigate();
  
  // All matched routes
  const matches = useMatches();
}
```

## Type Registration

For full type safety, register your router:

```tsx
// src/router.tsx
import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

export function getRouter() {
  return createRouter({
    routeTree,
  });
}

// Register router types globally
declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
```

## Common Patterns

### Preserving Search Params on Navigation

```tsx
const navigate = useNavigate();

// Keep all existing search params
navigate({
  to: '/posts/$postId',
  params: { postId: '456' },
  search: (prev) => prev,
});

// Keep some, change others
navigate({
  search: (prev) => ({
    ...prev,
    page: 1, // Reset page
    // sort and filter preserved
  }),
});
```

### Conditional Navigation

```tsx
const navigate = useNavigate();

// Navigate only if condition is met
if (isAuthorized) {
  navigate({ to: '/admin' });
} else {
  navigate({ to: '/login', search: { redirect: '/admin' } });
}
```

### Back/Forward Navigation

```tsx
const router = useRouter();

// Go back
router.history.back();

// Go forward
router.history.forward();

// Go to specific history index
router.history.go(-2);
```
