---
name: tanstack-start-routes
description: Create and manage routes in TanStack Start using file-based routing. Use when adding new pages, configuring layouts, setting up nested routes, or working with route parameters.
license: Apache-2.0
metadata:
  author: tanstack
  version: "1.0"
---

# TanStack Start Routes

TanStack Start uses file-based routing with TanStack Router. Routes are defined as files in the `src/routes` directory.

## When to Use

- Adding new pages to your application
- Setting up nested layouts
- Configuring route parameters
- Creating pathless layout routes
- Organizing route structure

## Directory Structure

```
src/
├── routes/
│   ├── __root.tsx          # Root layout (required)
│   ├── index.tsx           # Home page (/)
│   ├── about.tsx           # About page (/about)
│   ├── posts.tsx           # Posts layout (/posts)
│   ├── posts.index.tsx     # Posts index (/posts)
│   ├── posts.$postId.tsx   # Dynamic post (/posts/:postId)
│   ├── _auth.tsx           # Pathless layout (no URL segment)
│   ├── _auth.login.tsx     # Login under auth layout (/login)
│   └── _auth.register.tsx  # Register under auth layout (/register)
├── router.tsx              # Router configuration
└── routeTree.gen.ts        # Auto-generated route tree
```

## Root Route

The root route wraps all other routes and defines the document shell:

```tsx
// src/routes/__root.tsx
import { 
  Outlet, 
  createRootRoute, 
  HeadContent, 
  Scripts 
} from '@tanstack/react-router';
import type { ReactNode } from 'react';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'My App' },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        <Header />
        <main>
          <Outlet />
        </main>
        <Scripts />
      </body>
    </html>
  );
}

function Header() {
  return (
    <header>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/posts">Posts</Link>
      </nav>
    </header>
  );
}
```

## Basic Route

```tsx
// src/routes/about.tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/about')({
  component: AboutComponent,
});

function AboutComponent() {
  return (
    <div>
      <h1>About Us</h1>
      <p>This is the about page.</p>
    </div>
  );
}
```

## Index Route

Index routes render when the parent path is matched exactly:

```tsx
// src/routes/index.tsx (renders at /)
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: HomeComponent,
});

function HomeComponent() {
  return <h1>Welcome Home</h1>;
}
```

```tsx
// src/routes/posts.index.tsx (renders at /posts)
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/posts/')({
  component: PostsIndexComponent,
});

function PostsIndexComponent() {
  return <h2>Select a post from the list</h2>;
}
```

## Layout Routes

Layout routes wrap child routes with shared UI:

```tsx
// src/routes/posts.tsx
import { createFileRoute, Outlet, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/posts')({
  component: PostsLayoutComponent,
});

function PostsLayoutComponent() {
  return (
    <div className="posts-layout">
      <aside>
        <h2>Posts</h2>
        <nav>
          <Link to="/posts/1">Post 1</Link>
          <Link to="/posts/2">Post 2</Link>
        </nav>
      </aside>
      <div className="content">
        <Outlet /> {/* Child routes render here */}
      </div>
    </div>
  );
}
```

## Dynamic Route Parameters

Use `$paramName` for dynamic segments:

```tsx
// src/routes/posts.$postId.tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/posts/$postId')({
  component: PostComponent,
});

function PostComponent() {
  const { postId } = Route.useParams();
  
  return (
    <article>
      <h1>Post {postId}</h1>
    </article>
  );
}
```

### Multiple Parameters

```tsx
// src/routes/users.$userId.posts.$postId.tsx
// Matches: /users/123/posts/456
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/users/$userId/posts/$postId')({
  component: UserPostComponent,
});

function UserPostComponent() {
  const { userId, postId } = Route.useParams();
  
  return <div>User {userId}'s Post {postId}</div>;
}
```

## Pathless Layout Routes

Prefix with `_` for layouts that don't add URL segments:

```tsx
// src/routes/_auth.tsx
// This creates a layout but adds no URL segment
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ context }) => {
    // Redirect if already authenticated
    if (context.user) {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <Outlet />
      </div>
    </div>
  );
}
```

```tsx
// src/routes/_auth.login.tsx
// Renders at /login (not /_auth/login)
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/login')({
  component: LoginComponent,
});

function LoginComponent() {
  return <form>Login Form</form>;
}
```

## Catch-All (Splat) Routes

Use `$` for catch-all routes:

```tsx
// src/routes/files.$.tsx
// Matches: /files/any/path/here
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/files/$')({
  component: FilesComponent,
});

function FilesComponent() {
  const { _splat } = Route.useParams();
  // _splat = "any/path/here"
  
  return <div>File path: {_splat}</div>;
}
```

## 404 Not Found Route

```tsx
// src/routes/__root.tsx
import { createRootRoute } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function NotFoundComponent() {
  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <Link to="/">Go Home</Link>
    </div>
  );
}
```

## Route Configuration Options

```tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/posts/$postId')({
  // Component to render
  component: PostComponent,
  
  // Error boundary component
  errorComponent: ErrorComponent,
  
  // Loading/pending component
  pendingComponent: LoadingComponent,
  
  // Not found component (for this route)
  notFoundComponent: NotFoundComponent,
  
  // Validate and parse params
  parseParams: (params) => ({
    postId: parseInt(params.postId, 10),
  }),
  
  // Serialize params back to strings
  stringifyParams: (params) => ({
    postId: String(params.postId),
  }),
  
  // Validate search params
  validateSearch: (search) => ({
    page: Number(search.page) || 1,
  }),
});
```

## File Naming Conventions

| File Name | Route Path |
|-----------|------------|
| `index.tsx` | `/` |
| `about.tsx` | `/about` |
| `posts.tsx` | `/posts` (layout) |
| `posts.index.tsx` | `/posts` (index) |
| `posts.$postId.tsx` | `/posts/:postId` |
| `posts.$postId.edit.tsx` | `/posts/:postId/edit` |
| `_layout.tsx` | Pathless layout |
| `_layout.page.tsx` | `/page` with layout |
| `files.$.tsx` | `/files/*` (catch-all) |

## Directory vs Flat Routes

Both styles work and can be mixed:

**Flat (dot notation):**
```
routes/
├── posts.tsx
├── posts.index.tsx
└── posts.$postId.tsx
```

**Directory style:**
```
routes/
└── posts/
    ├── route.tsx      # Layout
    ├── index.tsx      # Index
    └── $postId.tsx    # Dynamic
```

## Router Configuration

```tsx
// src/router.tsx
import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

export function getRouter() {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
  });
  
  return router;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
```

## Common Patterns

### Protected Routes

```tsx
// src/routes/_protected.tsx
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_protected')({
  beforeLoad: async ({ context }) => {
    if (!context.user) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      });
    }
  },
  component: ProtectedLayout,
});
```

### Route Groups (Organization Only)

Use parentheses for grouping without affecting URLs:

```
routes/
├── (marketing)/
│   ├── about.tsx        # /about
│   └── pricing.tsx      # /pricing
└── (app)/
    ├── dashboard.tsx    # /dashboard
    └── settings.tsx     # /settings
```
