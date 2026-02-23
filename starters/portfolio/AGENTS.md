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
