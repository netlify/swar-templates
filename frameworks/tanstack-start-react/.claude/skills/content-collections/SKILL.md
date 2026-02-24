---
name: content-collections
description: Use content-collections for type-safe content management with markdown files. Use when building blogs, documentation sites, or any content-driven pages with frontmatter and markdown.
license: Apache-2.0
metadata:
  author: sdorra
  version: "1.0"
---

# Content Collections

Content Collections transforms markdown and other content files into type-safe data collections with full TypeScript support.

## When to Use

- Blog posts with frontmatter
- Documentation pages
- Content-driven sites
- Any structured content in markdown/JSON/YAML
- When you need type-safe content access

## Installation

```bash
npm install @content-collections/core
npm install -D @content-collections/vite  # For Vite/TanStack Start
```

## Basic Setup

### Configuration File

```typescript
// content-collections.ts
import { defineCollection, defineConfig } from '@content-collections/core';
import { z } from 'zod';

const posts = defineCollection({
  name: 'posts',
  directory: 'content/posts',
  include: '**/*.md',
  schema: (z) => ({
    title: z.string(),
    description: z.string().optional(),
    published: z.string().date(),
    author: z.string(),
    tags: z.array(z.string()).optional(),
  }),
});

export default defineConfig({
  collections: [posts],
});
```

### Vite/TanStack Start Integration

```typescript
// app.config.ts
import { defineConfig } from '@tanstack/react-start/config';
import contentCollections from '@content-collections/vite';

export default defineConfig({
  vite: {
    plugins: [contentCollections()],
  },
});
```

## Content File Structure

```
content/
├── posts/
│   ├── hello-world.md
│   ├── getting-started.md
│   └── advanced-topics.md
└── docs/
    ├── introduction.md
    └── api-reference.md
```

### Markdown File Format

```markdown
---
title: Hello World
description: My first blog post
published: 2024-01-15
author: Alice
tags:
  - introduction
  - tutorial
---

# Hello World

This is the content of my blog post.

## Getting Started

Here's how to get started...
```

## Using Collections

### Import Generated Data

```typescript
// Collections are auto-generated
import { allPosts } from 'content-collections';

// allPosts is an array of typed post objects
allPosts.forEach((post) => {
  console.log(post.title);        // string
  console.log(post.published);    // string (date)
  console.log(post.tags);         // string[] | undefined
  console.log(post._meta.path);   // file path without extension
  console.log(post.content);      // raw markdown content
});
```

### In TanStack Start Routes

```tsx
// src/routes/blog.tsx
import { createFileRoute } from '@tanstack/react-router';
import { allPosts } from 'content-collections';

export const Route = createFileRoute('/blog')({
  loader: () => {
    // Sort by date, newest first
    const posts = allPosts
      .sort((a, b) => 
        new Date(b.published).getTime() - new Date(a.published).getTime()
      );
    
    return { posts };
  },
  component: BlogComponent,
});

function BlogComponent() {
  const { posts } = Route.useLoaderData();
  
  return (
    <div>
      <h1>Blog</h1>
      <ul>
        {posts.map((post) => (
          <li key={post._meta.path}>
            <Link to="/blog/$slug" params={{ slug: post._meta.path }}>
              <h2>{post.title}</h2>
              <p>{post.description}</p>
              <time>{post.published}</time>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Individual Post Page

```tsx
// src/routes/blog.$slug.tsx
import { createFileRoute } from '@tanstack/react-router';
import { allPosts } from 'content-collections';

export const Route = createFileRoute('/blog/$slug')({
  loader: ({ params }) => {
    const post = allPosts.find((p) => p._meta.path === params.slug);
    
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
      <p>By {post.author} on {post.published}</p>
      
      {/* Render markdown content */}
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
    </article>
  );
}
```

## Transforming Content

### Compile Markdown to HTML

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
    published: z.string().date(),
  }),
  transform: async (document, context) => {
    // Compile markdown to HTML
    const html = await compileMarkdown(context, document);
    
    return {
      ...document,
      html,
      // Add computed fields
      slug: document._meta.path,
      readingTime: calculateReadingTime(document.content),
    };
  },
});

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}
```

### Install Markdown Package

```bash
npm install @content-collections/markdown
```

### Advanced Markdown with Plugins

```typescript
import { compileMarkdown } from '@content-collections/markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

const posts = defineCollection({
  name: 'posts',
  directory: 'content/posts',
  include: '**/*.md',
  schema: (z) => ({
    title: z.string(),
  }),
  transform: async (document, context) => {
    const html = await compileMarkdown(context, document, {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeHighlight],
      allowDangerousHtml: true,
    });
    
    return { ...document, html };
  },
});
```

## Multiple Collections

```typescript
// content-collections.ts
import { defineCollection, defineConfig } from '@content-collections/core';

const posts = defineCollection({
  name: 'posts',
  directory: 'content/posts',
  include: '**/*.md',
  schema: (z) => ({
    title: z.string(),
    published: z.string().date(),
    author: z.string(),
  }),
});

const docs = defineCollection({
  name: 'docs',
  directory: 'content/docs',
  include: '**/*.md',
  schema: (z) => ({
    title: z.string(),
    order: z.number().optional(),
    category: z.string().optional(),
  }),
});

const authors = defineCollection({
  name: 'authors',
  directory: 'content/authors',
  include: '**/*.json',
  schema: (z) => ({
    name: z.string(),
    email: z.string().email(),
    bio: z.string().optional(),
    avatar: z.string().optional(),
  }),
});

export default defineConfig({
  collections: [posts, docs, authors],
});
```

### Usage

```typescript
import { allPosts, allDocs, allAuthors } from 'content-collections';

// Each collection is independently typed
const post = allPosts[0];
const doc = allDocs[0];
const author = allAuthors[0];
```

## Joining Collections

```typescript
// content-collections.ts
const posts = defineCollection({
  name: 'posts',
  directory: 'content/posts',
  include: '**/*.md',
  schema: (z) => ({
    title: z.string(),
    authorId: z.string(), // Reference to author
  }),
  transform: async (document, context) => {
    // Find the author from the authors collection
    const author = context
      .documents(authors)
      .find((a) => a._meta.path === document.authorId);
    
    return {
      ...document,
      author: author ? {
        name: author.name,
        avatar: author.avatar,
      } : null,
    };
  },
});
```

## _meta Object

Every document includes a `_meta` object:

```typescript
{
  _meta: {
    path: "hello-world",      // File path without extension
    fileName: "hello-world.md",
    directory: "content/posts",
    extension: "md",
    filePath: "content/posts/hello-world.md",
  }
}
```

## Schema Validation

Content Collections uses Zod for schema validation:

```typescript
const posts = defineCollection({
  name: 'posts',
  directory: 'content/posts',
  include: '**/*.md',
  schema: (z) => ({
    // Required fields
    title: z.string().min(1).max(100),
    published: z.string().date(),
    
    // Optional fields
    description: z.string().optional(),
    draft: z.boolean().default(false),
    
    // Arrays
    tags: z.array(z.string()).default([]),
    
    // Enums
    category: z.enum(['tech', 'life', 'tutorial']),
    
    // Complex types
    author: z.object({
      name: z.string(),
      email: z.string().email(),
    }),
    
    // Coercion
    views: z.coerce.number().default(0),
  }),
});
```

## Development Workflow

### Hot Module Replacement

Content Collections supports HMR - changes to content files automatically update:

```bash
npm run dev
# Edit content/posts/hello-world.md
# Changes appear instantly in browser
```

### Build Validation

Invalid content fails the build:

```bash
npm run build
# Error: posts/bad-post.md - "published" is required
```

## Directory Structure Best Practice

```
project/
├── content/
│   ├── posts/
│   │   ├── 2024/
│   │   │   ├── hello-world.md
│   │   │   └── another-post.md
│   │   └── 2023/
│   │       └── old-post.md
│   ├── docs/
│   │   ├── getting-started.md
│   │   └── api/
│   │       └── reference.md
│   └── authors/
│       ├── alice.json
│       └── bob.json
├── content-collections.ts
├── app.config.ts
└── src/
    └── routes/
```

## TypeScript Support

Full type inference for all collections:

```typescript
import { allPosts } from 'content-collections';
import type { Post } from 'content-collections';

// Type is inferred
const post = allPosts[0];
post.title;      // string
post.published;  // string
post.tags;       // string[] | undefined

// Or use the generated type
function renderPost(post: Post) {
  return <h1>{post.title}</h1>;
}
```

## Common Patterns

### Filter Published Posts

```typescript
const publishedPosts = allPosts.filter((post) => !post.draft);
```

### Sort by Date

```typescript
const sortedPosts = allPosts.sort(
  (a, b) => new Date(b.published).getTime() - new Date(a.published).getTime()
);
```

### Group by Category

```typescript
const postsByCategory = allPosts.reduce((acc, post) => {
  const category = post.category || 'uncategorized';
  acc[category] = acc[category] || [];
  acc[category].push(post);
  return acc;
}, {} as Record<string, typeof allPosts>);
```

### Get Post by Slug

```typescript
function getPostBySlug(slug: string) {
  return allPosts.find((post) => post._meta.path === slug);
}
```
