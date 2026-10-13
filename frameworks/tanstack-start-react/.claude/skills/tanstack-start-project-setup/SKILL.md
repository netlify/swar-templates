---
name: tanstack-start-project-setup
description: Set up and configure TanStack Start projects. Use when creating new projects, configuring the router, setting up TanStack Query integration, or configuring build settings.
license: Apache-2.0
metadata:
  author: tanstack
  version: "1.0"
---

# TanStack Start Project Setup

TanStack Start is a full-stack React framework built on TanStack Router and Vite. These starters use the Netlify Vite adapter. Use the existing scaffold and exact versions in its `package.json` as the starting point.

## When to Use

- Creating a new TanStack Start project
- Configuring router settings
- Setting up TanStack Query
- Adding TypeScript configuration
- Configuring for Netlify deployment

## Quick Start

Use the supplied starter. Run `npm install`, then `npm run dev`. Run `npm run build` before `npm run typecheck` on a fresh checkout so the router and content plugins generate their types. Use Node 24 LTS from `.nvmrc`.

If adding a dependency, check its current stable release and peer requirements with `npm view <package>@latest version peerDependencies engines`. Update related packages together and run the build and type check. Do not copy old version ranges from examples.

## Project Structure

```
my-app/
├── src/
│   ├── routes/
│   │   ├── __root.tsx        # Root layout
│   │   ├── index.tsx         # Home page (/)
│   │   └── ...
│   ├── server/
│   │   └── *.functions.ts    # Server functions
│   ├── components/
│   ├── lib/
│   ├── router.tsx            # Router configuration
│   └── routeTree.gen.ts      # Auto-generated
├── public/
├── vite.config.ts            # Vite, TanStack Start, and Netlify plugins
├── package.json
├── tsconfig.json
└── netlify.toml              # Netlify deployment
```

## Essential Files

### vite.config.ts

```typescript
import { defineConfig } from 'vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';
import netlify from '@netlify/vite-plugin-tanstack-start';

export default defineConfig({
  plugins: [
    tsconfigPaths({ projects: ['./tsconfig.json'] }),
    tailwindcss(),
    netlify(),
    tanstackStart(),
    react(),
  ],
});
```

The Start plugin handles route generation and code splitting. Configure router plugin options inside `tanstackStart({ router: { ... } })` when needed; preserve the starter's default paths.

### router.tsx

```tsx
// src/router.tsx
import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

export function getRouter() {
  const router = createRouter({
    routeTree,
    
    // Enable scroll restoration
    scrollRestoration: true,
    
    // Preload on hover
    defaultPreload: 'intent',
    
    // Preload stale time
    defaultPreloadStaleTime: 0,
    
    // Default error component
    defaultErrorComponent: ({ error }) => (
      <div>Error: {error.message}</div>
    ),
    
    // Default pending component
    defaultPendingComponent: () => <div>Loading...</div>,
    
    // Default not found component
    defaultNotFoundComponent: () => <div>Not Found</div>,
  });
  
  return router;
}

// Type registration for full type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
```

### Root Route (__root.tsx)

```tsx
// src/routes/__root.tsx
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from '@tanstack/react-router';
import appCss from '../styles.css?url';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'My TanStack Start App' },
      { name: 'description', content: 'Built with TanStack Start' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
```

## TanStack Query Integration

### Installation

```bash
npm install @tanstack/react-query @tanstack/react-router-ssr-query
```

### Setup

Follow the [TanStack Query integration guide](https://tanstack.com/router/latest/docs/integrations/query) for the installed Router version. Create a new QueryClient inside `getRouter()` for each server request, declare the query client in the root route context, and use `setupRouterSsrQueryIntegration` from `@tanstack/react-router-ssr-query` for streaming/dehydration support. Do not share a module-level QueryClient between users. Query is optional and is not installed in these starters.

## TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "types": ["vite/client", "node"],
    "strict": true,
    "noEmit": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*", "vite.config.ts"],
  "exclude": ["node_modules"]
}
```

## Netlify Deployment

### netlify.toml

```toml
[build]
  command = "vite build"
  publish = "dist/client"

[build.environment]
  NODE_VERSION = "24"

[dev]
  framework = "#custom"
  command = "npm run dev"
  targetPort = 3000
  port = 8888
```

The Netlify Vite plugin generates the server output. Keep the existing adapter and publish directory. Do not add an SPA catch-all that bypasses SSR or server routes.

## Environment Variables

### .env Files

```bash
# .env (local development)
DATABASE_URL=postgres://localhost:5432/mydb
VITE_APP_NAME=My App

# .env.production (production)
DATABASE_URL=postgres://prod-server:5432/mydb
VITE_APP_NAME=My App
```

### Accessing Variables

```typescript
// Inside a server function or server-only module; route loaders also run in the browser
const dbUrl = process.env.DATABASE_URL;

// Client-side (must be prefixed with VITE_)
const appName = import.meta.env.VITE_APP_NAME;
```

## CSS/Styling Setup

### Tailwind CSS

```bash
npm install tailwindcss @tailwindcss/vite
```

Add `tailwindcss()` from `@tailwindcss/vite` to the existing `vite.config.ts`, as shown above.

```css
/* src/styles.css */
@import 'tailwindcss';
```

### CSS Modules

```tsx
// Component.tsx
import styles from './Component.module.css';

export function Component() {
  return <div className={styles.container}>Hello</div>;
}
```

## Development Scripts

```json
{
  "scripts": {
    "dev": "vite dev --port 3000",
    "build": "vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit"
  }
}
```

Vite builds do not type-check. Run both build and typecheck after edits. TypeScript 7 no longer supports `baseUrl`; use relative targets in `compilerOptions.paths`.

## Database Setup (Drizzle)

```bash
npm install drizzle-orm@beta @netlify/database
npm install -D drizzle-kit@beta
```

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './db/schema.ts',
  out: 'netlify/database/migrations',
});
```

```typescript
// db/index.ts
import { drizzle } from 'drizzle-orm/netlify-db';
import * as schema from './schema';

export const db = drizzle({ schema });
```

## Common Configurations

### Custom 404 Page

```tsx
// src/routes/__root.tsx
export const Route = createRootRoute({
  notFoundComponent: () => (
    <div className="not-found">
      <h1>404 - Page Not Found</h1>
      <Link to="/">Go Home</Link>
    </div>
  ),
});
```

### Global Error Boundary

```tsx
// src/routes/__root.tsx
export const Route = createRootRoute({
  errorComponent: ({ error, reset }) => (
    <div className="error-page">
      <h1>Something went wrong</h1>
      <p>{error.message}</p>
      <button onClick={reset}>Try Again</button>
    </div>
  ),
});
```

### Loading States

```tsx
// src/routes/__root.tsx
export const Route = createRootRoute({
  pendingComponent: () => (
    <div className="loading">
      <span className="spinner" />
      Loading...
    </div>
  ),
});
```

## Checklist for New Projects

- [ ] Start from the supplied starter and install its dependencies
- [ ] Preserve `vite.config.ts` with TanStack Start and the Netlify Vite plugin
- [ ] Set up TypeScript paths (`@/`)
- [ ] Configure TanStack Query if needed
- [ ] Set up CSS solution (Tailwind recommended)
- [ ] Create `.env` for local development
- [ ] Configure `netlify.toml` for deployment
- [ ] Set up database if needed (Drizzle + Netlify Database)
- [ ] Add ESLint configuration
- [ ] Set environment variables in Netlify dashboard

## Current references

- [TanStack Start setup](https://tanstack.com/start/latest/docs/framework/react/build-from-scratch)
- [Netlify TanStack Start guide](https://docs.netlify.com/build/frameworks/framework-setup-guides/tanstack-start/)
- [Vite migration guide](https://vite.dev/guide/migration)
