---
title: "Getting Started with TanStack Start"
date: "2026-01-15"
summary: "A comprehensive guide to building modern full-stack React applications with TanStack Start, including file-based routing and server functions."
tags: ["TanStack", "React", "TypeScript", "Full-Stack"]
author: "John Doe"
---

TanStack Start is a modern full-stack React framework that brings together the best of the TanStack ecosystem. In this post, we'll explore how to get up and running quickly.

## Why TanStack Start?

TanStack Start combines file-based routing, server functions, and a powerful data loading model into a cohesive framework. It's built on top of Vite, giving you lightning-fast development builds.

### Key Features

- **File-based routing** — Define routes by creating files in your `src/routes` directory
- **Server functions** — Write server-side code that runs securely on the backend
- **Type-safe routing** — Full TypeScript support with autocomplete for route paths
- **Data loaders** — Fetch data before your components render

## Getting Started

First, create a new project:

```bash
npx create-tanstack-app my-app
cd my-app
pnpm install
pnpm dev
```

## Creating Your First Route

Create a file at `src/routes/about.tsx`:

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return <h1>About Page</h1>
}
```

That's it! TanStack Start will automatically register this route and make it available at `/about`.

## Conclusion

TanStack Start makes building full-stack React applications a breeze. With its intuitive file-based routing and powerful data loading capabilities, you can focus on building great user experiences.
