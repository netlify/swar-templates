---
name: tanstack-start-project-setup
description: Set up and configure TanStack Start projects. Use when creating new projects, configuring the router, setting up TanStack Query integration, or configuring build settings.
license: Apache-2.0
metadata:
  author: tanstack
  version: "1.0"
---

# TanStack Start Project Setup

TanStack Start is a full-stack React framework built on TanStack Router, Vinxi, and Vite.

## When to Use

- Creating a new TanStack Start project
- Configuring router settings
- Setting up TanStack Query
- Adding TypeScript configuration
- Configuring for Netlify deployment

## Quick Start

```bash
# Create new project
npx create-tanstack-start@latest my-app

# Or with specific template
npx create-tanstack-start@latest my-app --template basic
```

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
├── app.config.ts             # TanStack Start config
├── package.json
├── tsconfig.json
└── netlify.toml              # Netlify deployment
```

## Essential Files

### app.config.ts

```typescript
// app.config.ts
import { defineConfig } from '@tanstack/react-start/config';

export default defineConfig({
  // Vite configuration
  vite: {
    // Add Vite plugins here
    plugins: [],
  },
  
  // Server configuration
  server: {
    // Server preset (netlify, vercel, node, etc.)
    preset: 'netlify',
  },
  
  // Router configuration
  tsr: {
    // Route file location
    routesDirectory: './src/routes',
    
    // Generated route tree location
    generatedRouteTree: './src/routeTree.gen.ts',
  },
});
```

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
import type { ReactNode } from 'react';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'My TanStack Start App' },
      { name: 'description', content: 'Built with TanStack Start' },
    ],
    links: [
      { rel: 'stylesheet', href: '/styles.css' },
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
npm install @tanstack/react-query
```

### Setup

```tsx
// src/router.tsx
import { createRouter } from '@tanstack/react-router';
import { QueryClient } from '@tanstack/react-query';
import { routeTree } from './routeTree.gen';

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60, // 1 minute
        gcTime: 1000 * 60 * 5, // 5 minutes
      },
    },
  });
  
  const router = createRouter({
    routeTree,
    context: {
      queryClient,
    },
  });
  
  return router;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
```

### Root with Query Provider

```tsx
// src/routes/__root.tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: RootComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  
  return (
    <QueryClientProvider client={queryClient}>
      <html lang="en">
        <head>
          <HeadContent />
        </head>
        <body>
          <Outlet />
          <Scripts />
          <ReactQueryDevtools />
        </body>
      </html>
    </QueryClientProvider>
  );
}
```

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
    "strict": true,
    "noEmit": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "paths": {
      "~/*": ["./src/*"]
    }
  },
  "include": ["src/**/*", "app.config.ts"],
  "exclude": ["node_modules"]
}
```

## Netlify Deployment

### netlify.toml

```toml
[build]
  command = "npm run build"
  publish = ".output/public"

[build.environment]
  NODE_VERSION = "20"

# Functions directory (auto-configured by TanStack Start)
[functions]
  directory = ".output/server"
```

### app.config.ts for Netlify

```typescript
// app.config.ts
import { defineConfig } from '@tanstack/react-start/config';

export default defineConfig({
  server: {
    preset: 'netlify',
  },
});
```

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
// Server-side (server functions, loaders on server)
const dbUrl = process.env.DATABASE_URL;

// Client-side (must be prefixed with VITE_)
const appName = import.meta.env.VITE_APP_NAME;
```

## CSS/Styling Setup

### Tailwind CSS

```bash
npm install tailwindcss @tailwindcss/vite
```

```typescript
// app.config.ts
import { defineConfig } from '@tanstack/react-start/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
});
```

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
// package.json
{
  "scripts": {
    "dev": "vinxi dev",
    "build": "vinxi build",
    "start": "vinxi start",
    "lint": "eslint src/",
    "typecheck": "tsc --noEmit"
  }
}
```

## Recommended Package.json

```json
{
  "name": "my-tanstack-app",
  "type": "module",
  "scripts": {
    "dev": "vinxi dev",
    "build": "vinxi build",
    "start": "vinxi start"
  },
  "dependencies": {
    "@tanstack/react-query": "^5.0.0",
    "@tanstack/react-router": "^1.0.0",
    "@tanstack/react-start": "^1.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "vinxi": "^0.5.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.6.0"
  }
}
```

## Database Setup (Drizzle)

```bash
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit
```

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

```typescript
// src/db/index.ts
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
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

- [ ] Create project with `create-tanstack-start`
- [ ] Configure `app.config.ts` with Netlify preset
- [ ] Set up TypeScript paths (`~/`)
- [ ] Configure TanStack Query if needed
- [ ] Set up CSS solution (Tailwind recommended)
- [ ] Create `.env` for local development
- [ ] Configure `netlify.toml` for deployment
- [ ] Set up database if needed (Drizzle + Neon)
- [ ] Add ESLint configuration
- [ ] Set environment variables in Netlify dashboard
