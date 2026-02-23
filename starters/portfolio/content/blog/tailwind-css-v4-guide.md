---
title: "What's New in Tailwind CSS v4"
date: "2026-02-01"
summary: "Explore the major changes in Tailwind CSS v4, including the new engine, CSS-first configuration, and improved performance."
tags: ["Tailwind CSS", "CSS", "Web Development"]
author: "John Doe"
---

Tailwind CSS v4 represents a ground-up rewrite of the framework with a brand new engine that delivers significant performance improvements.

## The New Engine

Tailwind CSS v4 features a completely rewritten engine called Oxide. It's built with Rust and delivers up to 10x faster builds compared to v3.

## CSS-First Configuration

One of the biggest changes is the move to CSS-first configuration. Instead of `tailwind.config.js`, you now configure Tailwind directly in your CSS:

```css
@import "tailwindcss";

@theme {
  --color-primary: #3b82f6;
  --color-secondary: #10b981;
}
```

## New Features

### Automatic Content Detection

Tailwind v4 automatically detects your content sources — no more configuring `content` paths in a config file.

### Container Queries

Built-in support for container queries using the `@container` variant:

```html
<div class="@container">
  <div class="@sm:grid-cols-2 @lg:grid-cols-3">
    <!-- Responsive based on container, not viewport -->
  </div>
</div>
```

### New Gradient Syntax

The gradient syntax has been updated from `bg-gradient-to-r` to `bg-linear-to-r` to better match the CSS specification.

## Migration

Migrating from v3 to v4 is straightforward with the official codemod:

```bash
npx @tailwindcss/upgrade
```

## Conclusion

Tailwind CSS v4 is a massive leap forward in terms of performance and developer experience. The CSS-first configuration approach makes it more aligned with web standards while keeping the utility-first approach we love.
