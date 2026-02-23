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
├── public
│   ├── favicon.ico
│   ├── logo.png
│   ├── motorcycle-scooter.jpg
│   ├── tanstack-circle-logo.png
│   └── tanstack-word-logo-white.svg  # TanStack wordmark logo (white) used in header/nav.
├── src
│   ├── components
│   │   ├── BuyButton.tsx  # Stripe checkout button component.
│   │   ├── Header.tsx  # Header with nav.
│   │   ├── HeaderNav.tsx  # Navigation sidebar template: mobile menu, Home link, add-on routes; EJS-driven for dynamic route generation.
│   │   ├── MotorcycleAIAssistant.tsx  # AI shopping assistant component.
│   │   └── MotorcycleRecommendation.tsx  # Motorcycle recommendation card display.
│   ├── data
│   │   └── motorcycles.ts  # Motorcycle catalog data.
│   ├── lib
│   │   ├── motorcycle-ai-hook.ts  # useMotorcycleChat hook for /api/motorcycle-chat.
│   │   ├── motorcycle-tools.ts  # AI tools: getMotorcycles, recommendMotorcycle.
│   │   └── stripe.server.ts  # Stripe server utilities for checkout.
│   ├── routes
│   │   ├── checkout
│   │   │   ├── cancel.tsx  # Stripe checkout cancel page.
│   │   │   └── success.tsx  # Stripe checkout success page.
│   │   ├── motorcycles
│   │   │   └── $motorcycleId.tsx  # Motorcycle detail page with BuyButton, recommendation.
│   │   ├── __root.tsx  # Root layout: Header, styles.
│   │   ├── api.motorcycle-chat.ts  # POST handler for motorcycle AI chat with getMotorcycles, recommendMotorcycle tools.
│   │   └── index.tsx  # Motorcycle catalog home with MotorcycleAIAssistant.
│   ├── store
│   │   └── motorcycle-assistant.ts  # Zustand store for assistant open state.
│   ├── router.tsx  # TanStack Router setup: creates router from generated routeTree with scroll restoration.
│   └── styles.css  # Global styles: Tailwind, prose.
├── .gitignore  # Template for .gitignore: node_modules, dist, .env, .netlify, .tanstack, etc.
├── AGENTS.md  # This document provides an overview of the project structure for developers and AI agents working on this codebase.
├── netlify.toml  # Netlify deployment config: build command (vite build), publish directory (dist/client), and dev server settings (port 8888, target 3000).
├── package.json  # Project manifest with TanStack Start, React 19, Vite 7, Tailwind CSS 4, and Netlify plugin dependencies; defines dev and build scripts.
├── pnpm-lock.yaml
├── tsconfig.json  # TypeScript config: ES2022 target, strict mode, @/* path alias for src/*, bundler module resolution.
└── vite.config.ts  # Vite config template: TanStack Start, React, Tailwind, Netlify plugin, and optional add-on integrations; processed by EJS.
```

## Key Concepts

### File-Based Routing (TanStack Router)

Routes are defined by files in `src/routes/`:

- `__root.tsx` - Root layout wrapping all pages
- `index.tsx` - Route for `/`
- `api.*.ts` - Server API endpoints (e.g., `api.resume-chat.ts` → `/api/resume-chat`)

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
### Ecommerce Integration

Motorcycle ecommerce site with Stripe checkout and AI shopping assistant.

**Stripe checkout:**
- `createCheckoutSession` server function in `src/lib/stripe.server.ts`
- BuyButton component redirects to Stripe Checkout
- Routes: `/checkout/success`, `/checkout/cancel`

**AI tools available:**
- `getMotorcycles` - Get all motorcycles from catalog
- `recommendMotorcycle` - Display motorcycle recommendation card (MUST use for recommendations; do not write recommendations manually)

**Dependencies:** stripe, @tanstack/ai, streamdown

## Environment Variables

```
STRIPE_SECRET_KEY=...  # Required for checkout
```

For AI assistant: ANTHROPIC_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY, or OLLAMA_BASE_URL (same as ai add-on).
