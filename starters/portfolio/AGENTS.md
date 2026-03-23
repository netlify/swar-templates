# AGENTS.md

This document provides an overview of the project structure for developers and AI agents working on this codebase.

## Project Overview

An interactive resume/portfolio application with an AI-powered assistant. Built with TanStack Start and deployed on Netlify.

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start |
| Frontend | React 19, TanStack Router v1 |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 |
| UI Components | Radix UI + custom components |
| Content | Content Collections (type-safe markdown) |
| AI | TanStack AI with multi-provider support |
| Language | TypeScript 5.7 (strict mode) |
| Deployment | Netlify |

## Directory Structure

```
├── content
│   ├── blog
│   │   ├── getting-started-with-tanstack.md  # Blog post.
│   │   ├── react-19-features.md  # Blog post.
│   │   └── tailwind-css-v4-guide.md  # Blog post.
│   ├── education
│   │   └── code-school.md  # Education content: Code School.
│   ├── jobs
│   │   └── initech-junior.md  # Job content: Initech Junior.
│   └── projects
│       ├── portfolio-site.md  # Project content.
│       └── task-manager.md  # Project content.
├── public
│   ├── contact.html  # Static contact form.
│   ├── favicon.ico
│   ├── headshot-on-white.jpg
│   ├── tanstack-circle-logo.png
│   └── tanstack-word-logo-white.svg  # TanStack wordmark logo (white) used in header/nav.
├── src
│   ├── components
│   │   ├── ui
│   │   │   ├── badge.tsx  # Badge component.
│   │   │   ├── card.tsx  # Card component.
│   │   │   ├── checkbox.tsx  # Checkbox component.
│   │   │   ├── hover-card.tsx  # HoverCard component.
│   │   │   └── separator.tsx  # Separator component.
│   │   ├── Header.tsx  # Header.
│   │   ├── HeaderNav.tsx  # Navigation sidebar template: mobile menu, Home link, add-on routes; EJS-driven for dynamic route generation.
│   │   └── ResumeAssistant.tsx  # Resume AI assistant.
│   ├── lib
│   │   ├── resume-ai-hook.ts  # useResumeChat hook.
│   │   ├── resume-tools.ts  # AI tools: getJobsBySkill, getAllJobs, getAllEducation, searchExperience.
│   │   └── utils.ts  # cn() helper.
│   ├── routes
│   │   ├── blog
│   │   │   └── $slug.tsx  # Blog post detail.
│   │   ├── __root.tsx  # Root layout.
│   │   ├── api.resume-chat.ts  # POST handler for resume AI chat with getJobsBySkill, getAllJobs, etc.
│   │   ├── contact.tsx  # Contact page.
│   │   ├── index.tsx  # Portfolio home: blog index.
│   │   ├── projects.tsx  # Projects page.
│   │   └── resume.tsx  # Resume page with ResumeAssistant.
│   ├── router.tsx  # TanStack Router setup: creates router from generated routeTree with scroll restoration.
│   └── styles.css  # Global styles.
├── .gitignore  # Template for .gitignore: node_modules, dist, .env, .netlify, .tanstack, etc.
├── AGENTS.md  # This document provides an overview of the project structure for developers and AI agents working on this codebase.
├── content-collections.ts  # Content Collections: jobs, education, blog, projects schemas.
├── netlify.toml  # Netlify deployment config: build command (vite build), publish directory (dist/client), and dev server settings (port 8888, target 3000).
├── package.json  # Project manifest with TanStack Start, React 19, Vite 7, Tailwind CSS 4, and Netlify plugin dependencies; defines dev and build scripts.
├── pnpm-lock.yaml
├── tsconfig.json  # TypeScript config: ES2022 target, strict mode, @/* path alias for src/*, bundler module resolution.
└── vite.config.ts  # Vite config template: TanStack Start, React, Tailwind, Netlify plugin, and optional add-on integrations; processed by EJS.
```

## Key Concepts

### Component Architecture

**UI Primitives** (`src/components/ui/`):
- Radix UI-based, Tailwind-styled
- Card, Badge, Checkbox, Separator, HoverCard

**Feature Components** (`src/components/`):
- Header, HeaderNav, ResumeAssistant

## Configuration Files

| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite plugins: TanStack Start, Netlify, Tailwind, Content Collections |
| `tsconfig.json` | TypeScript config with `@/*` path alias for `src/*` |
| `netlify.toml` | Build command, output directory, dev server settings |
| `content-collections.ts` | Zod schemas for jobs and education frontmatter |
| `styles.css` | Tailwind imports + CSS custom properties (oklch colors) |

## Development Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
```

## Conventions

### Naming
- Components: PascalCase
- Utilities/hooks: camelCase
- Routes: kebab-case files

### Styling
- Tailwind CSS utility classes
- `cn()` helper for conditional class merging
- CSS variables for theme tokens in `styles.css`

### TypeScript
- Strict mode enabled
- Import paths use `@/` alias
- Zod for runtime validation
- Type-only imports with `type` keyword

### State Management
- React hooks for local state
- Zustand if you need it for global state
### Portfolio Integration

Developer portfolio with Content Collections (jobs, education, blog, projects) and ResumeAssistant.

**Content Collections:**
- `jobs` - jobTitle, company, startDate, endDate, location, tags, content
- `education` - school, summary, startDate, endDate, tags, content
- `blog` - title, date, summary, tags, author, content
- `projects` - title, description, tags, github, liveUrl, image, content

**AI tools available (ResumeAssistant):**
- `getJobsBySkill` - Query jobs by skill tag
- `getAllJobs` - Get all work experience
- `getAllEducation` - Get education history
- `searchExperience` - Full-text search across resume

**Routes:** /, /resume, /projects, /contact, /blog/$slug

## Environment Variables

For AI: ANTHROPIC_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY, or OLLAMA_BASE_URL (same as ai add-on).

---

## TanStack Start Framework Reference

## Project Setup

TanStack Start is a full-stack React framework built on TanStack Router and Vite.

### Project Structure

```
my-app/
├── src/
│   ├── routes/
│   │   ├── __root.tsx        # Root layout (required)
│   │   ├── index.tsx         # Home page (/)
│   │   └── ...
│   ├── server/
│   │   └── *.functions.ts    # Server functions
│   ├── components/
│   ├── lib/
│   ├── router.tsx            # Router configuration
│   └── routeTree.gen.ts      # Auto-generated route tree
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── netlify.toml
```

### Essential Configuration

```typescript
// vite.config.ts — uses @netlify/vite-plugin-tanstack-start for deployment
import { defineConfig } from '@tanstack/react-start/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
});
```

```tsx
// src/router.tsx
import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
  });
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
```

```tsx
// src/routes/__root.tsx
import { Outlet, createRootRoute, HeadContent, Scripts } from '@tanstack/react-router';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'My App' },
    ],
  }),
  component: () => (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  ),
});
```

### TanStack Query Integration

```tsx
// src/router.tsx — with Query
import { createRouter } from '@tanstack/react-router';
import { QueryClient } from '@tanstack/react-query';
import { routeTree } from './routeTree.gen';

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000 } },
  });
  return createRouter({ routeTree, context: { queryClient } });
}
```

```tsx
// src/routes/__root.tsx — with QueryProvider
import { createRootRouteWithContext } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: () => {
    const { queryClient } = Route.useRouteContext();
    return (
      <QueryClientProvider client={queryClient}>
        {/* html/head/body/Outlet/Scripts */}
      </QueryClientProvider>
    );
  },
});
```

### Environment Variables

```typescript
// Server-side (server functions, loaders on server)
const secret = process.env.DATABASE_URL;

// Client-side (must be VITE_ prefixed)
const appName = import.meta.env.VITE_APP_NAME;
```

---

## File-Based Routing

Routes are files in `src/routes/`. TanStack Router auto-generates a type-safe route tree.

### File Naming Conventions

| File Name | Route Path | Purpose |
|-----------|------------|---------|
| `__root.tsx` | — | Root layout (required) |
| `index.tsx` | `/` | Home page |
| `about.tsx` | `/about` | Static route |
| `posts.tsx` | `/posts` | Layout with `<Outlet />` |
| `posts.index.tsx` | `/posts` | Index for layout |
| `posts.$postId.tsx` | `/posts/:postId` | Dynamic parameter |
| `_auth.tsx` | — | Pathless layout (no URL segment) |
| `_auth.login.tsx` | `/login` | Child of pathless layout |
| `files.$.tsx` | `/files/*` | Catch-all (splat) route |

Both flat (dot notation) and directory styles work:

```
# Flat                        # Directory
routes/                       routes/
├── posts.tsx                 └── posts/
├── posts.index.tsx               ├── route.tsx
└── posts.$postId.tsx             ├── index.tsx
                                  └── $postId.tsx
```

### Basic Route

```tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/about')({
  component: () => <h1>About</h1>,
});
```

### Layout Route

```tsx
// src/routes/posts.tsx — wraps child routes
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/posts')({
  component: () => (
    <div>
      <h2>Posts</h2>
      <Outlet />
    </div>
  ),
});
```

### Dynamic Parameters

```tsx
// src/routes/posts.$postId.tsx
export const Route = createFileRoute('/posts/$postId')({
  component: () => {
    const { postId } = Route.useParams(); // { postId: string }
    return <h1>Post {postId}</h1>;
  },
});
```

### Pathless Layout Route

Prefix with `_` for layouts that don't add a URL segment:

```tsx
// src/routes/_auth.tsx — no URL segment, just wraps children
export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ context }) => {
    if (context.user) throw redirect({ to: '/dashboard' });
  },
  component: () => (
    <div className="auth-container"><Outlet /></div>
  ),
});

// src/routes/_auth.login.tsx — renders at /login (not /_auth/login)
export const Route = createFileRoute('/_auth/login')({
  component: () => <form>Login Form</form>,
});
```

### Route Configuration Options

```tsx
export const Route = createFileRoute('/posts/$postId')({
  component: PostComponent,
  errorComponent: ({ error }) => <div>Error: {error.message}</div>,
  pendingComponent: () => <div>Loading...</div>,
  notFoundComponent: () => <div>Not Found</div>,
  validateSearch: (search) => ({ page: Number(search.page) || 1 }),
});
```

---

## Type-Safe Navigation

TanStack Router provides full TypeScript safety for links, navigation, and search params.

### Links

```tsx
import { Link } from '@tanstack/react-router';

// TypeScript enforces valid routes and required params
<Link to="/">Home</Link>
<Link to="/posts/$postId" params={{ postId: '123' }}>View Post</Link>
<Link to="/posts" search={{ page: 1, sort: 'newest' }}>Posts</Link>

// Active link styling
<Link
  to="/posts"
  activeProps={{ className: 'text-blue-600 font-bold' }}
  inactiveProps={{ className: 'text-gray-600' }}
  activeOptions={{ exact: true }}
>
  Posts
</Link>
```

### Programmatic Navigation

```tsx
import { useNavigate } from '@tanstack/react-router';

const navigate = useNavigate();

navigate({ to: '/posts' });
navigate({ to: '/posts/$postId', params: { postId: '123' } });
navigate({ to: '/posts', search: { page: 2 } });
navigate({ to: '/login', replace: true });

// Update search params, preserving existing
navigate({ search: (prev) => ({ ...prev, page: 1 }) });
```

### Search Parameters with Validation

```tsx
import { z } from 'zod';

const SearchSchema = z.object({
  page: z.number().default(1),
  sort: z.enum(['newest', 'oldest']).default('newest'),
  filter: z.string().optional(),
});

export const Route = createFileRoute('/posts')({
  validateSearch: SearchSchema,
  component: () => {
    const search = Route.useSearch(); // fully typed
    return <div>Page: {search.page}, Sort: {search.sort}</div>;
  },
});
```

### Router Hooks

```tsx
import { useRouter, useLocation, useParams, useSearch, useMatches } from '@tanstack/react-router';

const location = useLocation();          // pathname, search, hash
const params = useParams({ from: '/posts/$postId' }); // typed params
const search = useSearch({ from: '/posts' });          // typed search
const matches = useMatches();            // all matched routes
```

---

## Data Loading

TanStack Start provides `beforeLoad` and `loader` for route data loading. Both are **isomorphic** — they run on the server during SSR and on the client during navigation.

> **Critical Rule:** Loaders must call server functions for database access, API calls with secrets, or any server-only resources. Loaders run on both server and client, so direct DB access will fail on client-side navigation.

```tsx
// ❌ WRONG — direct DB access in loader (fails on client navigation)
loader: async () => {
  const posts = await db.query('SELECT * FROM posts');
  return { posts };
},

// ✅ CORRECT — call server function from loader
import { getPosts } from '../server/posts.functions';

loader: async () => {
  const posts = await getPosts();
  return { posts };
},
```

### beforeLoad vs loader

| Feature | beforeLoad | loader |
|---------|------------|--------|
| Execution | Sequential (parent → child) | Parallel across routes |
| Return | Merges into route context | Route-specific data |
| Use case | Guards, auth, context setup | Data fetching |

### beforeLoad (Guards & Context)

```tsx
export const Route = createFileRoute('/_protected')({
  beforeLoad: async () => {
    const user = await getUser();
    if (!user) throw redirect({ to: '/login' });
    return { user }; // available to child routes via context
  },
});
```

### loader (Data Fetching)

```tsx
export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params }) => {
    const post = await getPost({ data: { id: params.postId } });
    if (!post) throw new Error('Post not found');
    return { post };
  },
  component: () => {
    const { post } = Route.useLoaderData();
    return <h1>{post.title}</h1>;
  },
});
```

### Loader Dependencies (Re-run on Search Param Changes)

```tsx
export const Route = createFileRoute('/posts')({
  validateSearch: (search) => ({
    page: Number(search.page) || 1,
    filter: search.filter as string | undefined,
  }),
  loaderDeps: ({ search }) => ({ page: search.page, filter: search.filter }),
  loader: async ({ deps }) => {
    return await searchPosts({ data: { page: deps.page, filter: deps.filter } });
  },
});
```

### Deferred Data

```tsx
export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params }) => {
    const post = await getPost({ data: { id: params.postId } });
    const commentsPromise = getComments({ data: { postId: params.postId } }); // don't await
    return { post, comments: commentsPromise };
  },
  component: () => {
    const { post, comments } = Route.useLoaderData();
    return (
      <article>
        <h1>{post.title}</h1>
        <Suspense fallback={<p>Loading comments...</p>}>
          <Await promise={comments}>
            {(resolved) => resolved.map((c) => <div key={c.id}>{c.text}</div>)}
          </Await>
        </Suspense>
      </article>
    );
  },
});
```

### Stale Time & Caching

```tsx
export const Route = createFileRoute('/posts')({
  staleTime: 5 * 60_000,        // data fresh for 5 min
  preloadStaleTime: 30_000,     // preloaded data fresh for 30s
  gcTime: 10 * 60_000,          // garbage collect after 10 min
  loader: async () => ({ posts: await getPosts() }),
});
```

---

## Server Functions

Server functions are the primary way to run server-side code. They provide type-safe RPC from client to server and run **only on the server**.

```typescript
// src/server/posts.functions.ts
import { createServerFn } from '@tanstack/react-start';

export const getPosts = createServerFn().handler(async () => {
  return await db.query('SELECT * FROM posts');
});

// With input validation
export const getPost = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    return await db.query('SELECT * FROM posts WHERE id = $1', [data.id]);
  });

// POST for mutations
export const createPost = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    title: z.string().min(1),
    content: z.string(),
  }))
  .handler(async ({ data }) => {
    return await db.insert('posts', data);
  });
```

### File Organization

```
src/server/
├── posts.functions.ts     # Server function wrappers (safe to import anywhere)
├── posts.server.ts        # Server-only helpers (NEVER import in client code)
├── users.functions.ts
└── schemas.ts             # Shared Zod schemas
```

### Middleware

```typescript
import { createServerFn, createMiddleware } from '@tanstack/react-start';

const authMiddleware = createMiddleware().handler(async ({ next }) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  return next({ user });
});

export const getSecretData = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return { secret: 'data', user: context.user };
  });
```

### Using Server Functions in Components

```tsx
import { useServerFn } from '@tanstack/react-start';
import { useMutation } from '@tanstack/react-query';

function PostForm() {
  const createPostFn = useServerFn(createPost);
  const mutation = useMutation({
    mutationFn: (data: { title: string; content: string }) => createPostFn({ data }),
  });

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      mutation.mutate({ title: fd.get('title') as string, content: fd.get('content') as string });
    }}>
      <input name="title" required />
      <textarea name="content" />
      <button type="submit" disabled={mutation.isPending}>Create</button>
    </form>
  );
}
```

### Redirects from Server Functions

```typescript
import { redirect } from '@tanstack/react-router';

export const loginUser = createServerFn({ method: 'POST' })
  .inputValidator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    const user = await authenticate(data.email, data.password);
    if (!user) return { error: 'Invalid credentials' };
    await createSession(user.id);
    throw redirect({ to: '/dashboard' });
  });
```

---

## API Routes (Server Routes)

For traditional HTTP endpoints that return data (not pages). For RPC-style calls from components, use server functions instead.

```typescript
// src/routes/api/hello.ts
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/hello')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return Response.json({ message: 'Hello' });
      },
    },
  },
});
```

### Multiple Methods & Dynamic Params

```typescript
// src/routes/api/users/$id.ts
export const Route = createFileRoute('/api/users/$id')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const user = await getUser(params.id);
        if (!user) return Response.json({ error: 'Not found' }, { status: 404 });
        return Response.json(user);
      },
      PUT: async ({ request, params }) => {
        const body = await request.json();
        return Response.json(await updateUser(params.id, body));
      },
      DELETE: async ({ params }) => {
        await deleteUser(params.id);
        return new Response(null, { status: 204 });
      },
    },
  },
});
```

### Handler Context

Handlers receive `{ request, params }`. Use `request.headers`, `new URL(request.url).searchParams`, `request.json()`, `request.formData()`, etc.

### File Naming for API Routes

| File Path | API Route |
|-----------|-----------|
| `routes/api/hello.ts` | `/api/hello` |
| `routes/api/users/$id.ts` | `/api/users/:id` |
| `routes/api/file/$.ts` | `/api/file/*` (catch-all) |

---

## Netlify Identity Authentication

Uses `@netlify/identity` for auth across SSR pages, SPA pages, API routes, server functions, and middleware.

> **Warning:** Authentication does NOT work on localhost. Requires a real Netlify deployment for the `nf_jwt` cookie.

### Setup

```bash
npm install @netlify/identity
```

```env
# .env
VITE_NETLIFY_SITE_URL=https://your-site.netlify.app
```

### Auth Utility

```typescript
// src/lib/auth.ts
import { createServerFn } from '@tanstack/react-start';
import { getUser } from '@netlify/identity';

export const getServerUser = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await getUser();
  return (user ?? null) as any;
});
```

### Middleware

```typescript
// src/middleware/identity.ts
import { createMiddleware } from '@tanstack/react-start';
import { getUser, type User } from '@netlify/identity';

export const identityMiddleware = createMiddleware().server(async ({ next }) => {
  const user: User | null = (await getUser()) ?? null;
  return next({ context: { user } });
});

export const requireAuthMiddleware = createMiddleware().server(async ({ next }) => {
  const user = await getUser();
  if (!user) throw new Error('Authentication required');
  return next({ context: { user } });
});

export function requireRoleMiddleware(role: string) {
  return createMiddleware().server(async ({ next }) => {
    const user = await getUser();
    if (!user) throw new Error('Authentication required');
    if (!user.roles?.includes(role)) throw new Error(`Role '${role}' required`);
    return next({ context: { user } });
  });
}
```

### Client-Side Auth Context

```tsx
// src/lib/identity-context.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getUser, logout as nlLogout, onAuthChange, type User } from '@netlify/identity';

interface IdentityContextValue { user: User | null; ready: boolean; logout: () => Promise<void> }

const IdentityContext = createContext<IdentityContextValue | null>(null);

export function IdentityProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getUser().then((u) => { setUser(u ?? null); setReady(true); });
    const unsub = onAuthChange((u) => setUser(u ?? null));
    return unsub;
  }, []);

  return (
    <IdentityContext.Provider value={{ user, ready, logout: nlLogout }}>
      {children}
    </IdentityContext.Provider>
  );
}

export function useIdentity() {
  const ctx = useContext(IdentityContext);
  if (!ctx) throw new Error('useIdentity must be used within an IdentityProvider');
  return ctx;
}
```

### CallbackHandler (OAuth Redirects)

```tsx
// src/components/CallbackHandler.tsx
import { useEffect } from 'react';
import { handleAuthCallback } from '@netlify/identity';

const AUTH_HASH = /^#(confirmation_token|recovery_token|invite_token|email_change_token|access_token)=/;

export function CallbackHandler({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (AUTH_HASH.test(window.location.hash)) handleAuthCallback();
  }, []);
  return <>{children}</>;
}
```

### Wire into Root

```tsx
// src/routes/__root.tsx
import { IdentityProvider } from '../lib/identity-context';
import { CallbackHandler } from '../components/CallbackHandler';

export const Route = createRootRoute({
  component: () => (
    <IdentityProvider>
      <CallbackHandler>
        {/* existing layout */}
      </CallbackHandler>
    </IdentityProvider>
  ),
});
```

### SSR Protected Route

```tsx
export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    const user = await getServerUser();
    if (!user) throw redirect({ to: '/login' });
    return { user };
  },
  component: () => {
    const { user } = Route.useRouteContext();
    return <div>Welcome, {user.name || user.email}</div>;
  },
});
```

### SPA Protected Route

```tsx
function ProfilePage() {
  const { user, ready } = useIdentity();
  const navigate = useNavigate();
  if (!ready) return <div>Loading...</div>;
  if (!user) { navigate({ to: '/login' }); return null; }
  return <div>Hello, {user.name || user.email}</div>;
}
```

### Login Page

```tsx
import { login, signup, oauthLogin } from '@netlify/identity';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  return (
    <div>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={async () => { await login(email, password); navigate({ to: '/dashboard' }); }}>
        Log in
      </button>
      <button onClick={() => oauthLogin('github')}>Continue with GitHub</button>
    </div>
  );
}
```

### Role-Based Access

```tsx
// Route guard
export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
    const user = await getServerUser();
    if (!user) throw redirect({ to: '/login' });
    if (!user.roles?.includes('admin')) throw redirect({ to: '/unauthorized' });
    return { user };
  },
});

// Server function with role middleware
export const deleteUser = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware, requireRoleMiddleware('admin')])
  .handler(async ({ context, data }) => {
    return await db.users.delete({ where: { id: data.userId } });
  });
```

### Identity Webhooks (Netlify Functions)

```typescript
// netlify/functions/identity-signup.ts
import type { Handler } from '@netlify/functions';

const handler: Handler = async (event) => {
  const user = JSON.parse(event.body || '{}');
  return {
    statusCode: 200,
    body: JSON.stringify({
      app_metadata: { roles: ['user'] },
      user_metadata: { ...user.user_metadata, signed_up_at: new Date().toISOString() },
    }),
  };
};
export { handler };
```

Available events: `identity-signup`, `identity-login`, `identity-validate`.

### Signup Flow

Signup requires email confirmation. After `signup(email, password, { full_name })`, show a "check your email" message — the user is NOT logged in until they click the confirmation link. `CallbackHandler` handles `#confirmation_token=...` automatically.

### User Type

```typescript
interface User {
  id: string;
  email: string;
  name: string;            // from user_metadata.full_name
  metadata: Record<string, unknown>;
  appMetadata: Record<string, unknown>;
  roles: string[];         // from app_metadata.roles
  pictureUrl?: string;
}
```

### Gotchas

- **Localhost doesn't work** — requires real Netlify deployment for `nf_jwt` cookie
- **Hydration** — `IdentityProvider` renders with `ready: false` during SSR to avoid mismatches
- **Token refresh** — JWTs expire after 1 hour; `onAuthChange` handles refresh automatically
- **Edge functions** — may intercept `/.netlify/identity`; add exclusion in `netlify.toml` if needed:
  ```toml
  [[edge_functions]]
    path = "/*"
    function = "server"
    excludedPath = "/.netlify/*"
  ```

---

## Content Collections

Type-safe content management for markdown files (blogs, docs, etc.).

### Setup

```bash
npm install @content-collections/core @content-collections/markdown
npm install -D @content-collections/vite
```

```typescript
// content-collections.ts
import { defineCollection, defineConfig } from '@content-collections/core';
import { compileMarkdown } from '@content-collections/markdown';

const posts = defineCollection({
  name: 'posts',
  directory: 'content/posts',
  include: '**/*.md',
  schema: (z) => ({
    title: z.string(),
    description: z.string().optional(),
    published: z.string().date(),
    author: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
  transform: async (document, context) => {
    const html = await compileMarkdown(context, document);
    return {
      ...document,
      html,
      slug: document._meta.path,
    };
  },
});

export default defineConfig({ collections: [posts] });
```

```typescript
// vite.config.ts — add plugin
import contentCollections from '@content-collections/vite';

export default defineConfig({
  vite: {
    plugins: [contentCollections()],
  },
});
```

### Usage in Routes

```tsx
import { allPosts } from 'content-collections';

export const Route = createFileRoute('/blog')({
  loader: () => ({
    posts: allPosts
      .filter((p) => !p.draft)
      .sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime()),
  }),
  component: () => {
    const { posts } = Route.useLoaderData();
    return (
      <ul>
        {posts.map((post) => (
          <li key={post.slug}>
            <Link to="/blog/$slug" params={{ slug: post.slug }}>{post.title}</Link>
          </li>
        ))}
      </ul>
    );
  },
});
```

### Individual Post

```tsx
export const Route = createFileRoute('/blog/$slug')({
  loader: ({ params }) => {
    const post = allPosts.find((p) => p._meta.path === params.slug);
    if (!post) throw new Error('Post not found');
    return { post };
  },
  component: () => {
    const { post } = Route.useLoaderData();
    return (
      <article>
        <h1>{post.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: post.html }} />
      </article>
    );
  },
});
```

### `_meta` Object

Every document has `_meta`: `{ path, fileName, directory, extension, filePath }`.

### Multiple Collections

```typescript
const docs = defineCollection({
  name: 'docs',
  directory: 'content/docs',
  include: '**/*.md',
  schema: (z) => ({ title: z.string(), order: z.number().optional() }),
});

export default defineConfig({ collections: [posts, docs] });
```

```typescript
import { allPosts, allDocs } from 'content-collections';
```

---

## Netlify Forms

Netlify's build-time form detection scans static HTML. TanStack Start renders via React, so Netlify can't detect forms in components. The fix: place a hidden static HTML form in `public/`.

### Static Form Skeleton

```html
<!-- public/contact-form.html -->
<!DOCTYPE html>
<html>
  <body>
    <form name="contact" netlify netlify-honeypot="bot-field" hidden>
      <input type="text" name="name" />
      <input type="email" name="email" />
      <textarea name="message"></textarea>
    </form>
  </body>
</html>
```

The `name` attribute must exactly match the React component's `form-name` value. Include every field.

### React Component

```tsx
function encode(data: Record<string, string>) {
  return Object.entries(data)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}

export function ContactForm() {
  const [fields, setFields] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/contact-form.html', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encode({ 'form-name': 'contact', ...fields }),
    });
    setSubmitted(true);
  };

  if (submitted) return <p>Thanks! We'll be in touch.</p>;

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="form-name" value="contact" />
      <input name="name" value={fields.name} onChange={(e) => setFields({ ...fields, name: e.target.value })} required />
      <input name="email" type="email" value={fields.email} onChange={(e) => setFields({ ...fields, email: e.target.value })} required />
      <textarea name="message" value={fields.message} onChange={(e) => setFields({ ...fields, message: e.target.value })} required />
      <button type="submit">Send</button>
    </form>
  );
}
```

**Key points:**
- Hidden `<input name="form-name">` is mandatory
- `fetch` URL must point to the static file path (`/contact-form.html`), NOT `/` — SSR intercepts `/`
- Use `application/x-www-form-urlencoded`, not JSON
- Forms only work on deployed Netlify sites, not local dev

## Application Name

This starter uses "Application Name" as a placeholder throughout the UI and metadata. Replace it with the user's desired application name in the following locations:

### UI Components
- `src/components/Header.tsx` — app name displayed in the header
- `src/components/HeaderNav.tsx` — app name in the mobile navigation header

### SEO Metadata
- `src/routes/__root.tsx` — the `title` field in the `head()` configuration

Search for all occurrences of "Application Name" in the `src/` directory and replace with the user's application name.
